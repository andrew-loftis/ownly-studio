import { NextRequest, NextResponse } from "next/server";
import { isAdminAvailable } from "@/lib/firebaseAdmin";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { runQuery, patchDocument, fs } from "@/lib/server/firestoreRest";
import { generateInvoicePDF, createInvoiceData } from "@/lib/invoices/pdf-generator";

// Email service configuration (you can use SendGrid, AWS SES, or similar)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "billing@ownly.studio";

/**
 * POST /api/admin/invoices/[id]/send - Send invoice via email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = id;
    
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken: any;
    if (isAdminAvailable()) {
      const { getAdminAuth } = await import('@/lib/firebaseAdmin');
      const auth = getAdminAuth();
      decodedToken = await auth.verifyIdToken(token);
    } else {
      decodedToken = await verifyFirebaseIdToken(token);
    }
    const userId = decodedToken.uid;

    // Get invoice via REST collection group query
    const structuredQuery = {
      from: [{ collectionId: 'invoices', allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: '__name__' },
          op: 'EQUAL',
          value: { referenceValue: `projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/_/invoices/${invoiceId}` }
        }
      },
      limit: 1
    } as any;
    const results = await runQuery(structuredQuery, token);
    const first = results.find((r: any) => r.document?.name);
    if (!first) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    const invoiceDoc = first.document;
    const invoiceData = invoiceDoc.fields as any;

    // Determine org from parent path and verify access
    const name: string = invoiceDoc.name; // projects/.../documents/orgs/{orgId}/invoices/{invoiceId}
    const parts = name.split('/');
    const orgIndex = parts.indexOf('orgs');
    const orgId = orgIndex >= 0 ? parts[orgIndex + 1] : undefined;
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    
    const adminUids = invoiceData.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = invoiceData.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(userId) && !editorUids.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

  // Create invoice data for PDF generation (fallback org info minimal)
  const pdfData = createInvoiceData({ invoiceDoc, orgData: { name: 'Organization' } as any });

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(pdfData);

    // Send email with invoice attachment
    const emailSent = await sendInvoiceEmail({
      to: invoiceData.billingEmail?.stringValue,
      invoiceNumber: invoiceData.invoiceNumber?.stringValue,
      total: Number(invoiceData.total?.integerValue || invoiceData.total?.doubleValue || 0),
      dueDate: invoiceData.dueDate?.timestampValue ? new Date(invoiceData.dueDate.timestampValue) : new Date(),
      pdfBuffer,
      clientName: 'Client',
    });

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Update invoice status and sent history
    const currentSentTo = invoiceData.sentTo?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const docName: string = invoiceDoc.name.replace(`projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/`, '');
    await patchDocument(docName, {
      sentAt: fs.timestamp(new Date()),
      sentTo: fs.array([...currentSentTo, invoiceData.billingEmail?.stringValue].filter(Boolean).map(fs.string)),
      status: fs.string(invoiceData.status?.stringValue === 'draft' ? 'open' : (invoiceData.status?.stringValue || 'open')),
      updatedAt: fs.timestamp(new Date()),
    }, token);

    return NextResponse.json({ 
      success: true, 
      message: "Invoice sent successfully" 
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to send invoice" 
    }, { status: 500 });
  }
}

/**
 * Send invoice email using SendGrid (or your preferred email service)
 */
async function sendInvoiceEmail({
  to,
  invoiceNumber,
  total,
  dueDate,
  pdfBuffer,
  clientName,
}: {
  to: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
  pdfBuffer: Buffer;
  clientName: string;
}): Promise<boolean> {
  try {
    // If SendGrid is configured, use it
    if (SENDGRID_API_KEY) {
      return await sendWithSendGrid({
        to,
        invoiceNumber,
        total,
        dueDate,
        pdfBuffer,
        clientName,
      });
    }

    // Fallback: Log email details (for development)
    console.log("📧 Email would be sent:", {
      to,
      subject: `Invoice ${invoiceNumber} from Ownly Studio`,
      amount: `$${total.toFixed(2)}`,
      dueDate: dueDate.toLocaleDateString(),
      attachmentSize: `${(pdfBuffer.length / 1024).toFixed(1)}KB`,
    });

    return true; // Return true for development
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid({
  to,
  invoiceNumber,
  total,
  dueDate,
  pdfBuffer,
  clientName,
}: {
  to: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
  pdfBuffer: Buffer;
  clientName: string;
}): Promise<boolean> {
  try {
    // dynamic import to avoid bundling when not installed
    // @ts-ignore - optional dependency only required when SENDGRID_API_KEY is set
    const sgMail = (await import('@sendgrid/mail')).default as any;
    sgMail.setApiKey(SENDGRID_API_KEY);

    const msg = {
      to,
      from: FROM_EMAIL,
      subject: `Invoice ${invoiceNumber} from Ownly Studio`,
      text: `Dear ${clientName},

Please find attached invoice ${invoiceNumber} for $${total.toFixed(2)}.

Due Date: ${dueDate.toLocaleDateString()}

You can view and pay this invoice online at: https://ownly.studio/invoice/${invoiceNumber}

Thank you for your business!

Best regards,
Ownly Studio Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Invoice ${invoiceNumber}</h1>
          </div>
          
          <div style="padding: 40px; background: #f8f9fa;">
            <p style="font-size: 16px; color: #333;">Dear ${clientName},</p>
            
            <p style="font-size: 16px; color: #333;">
              Please find attached invoice ${invoiceNumber} for <strong>$${total.toFixed(2)}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666;">
                <strong>Due Date:</strong> ${dueDate.toLocaleDateString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ownly.studio/invoice/${invoiceNumber}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View & Pay Invoice Online
              </a>
            </div>
            
            <p style="font-size: 16px; color: #333;">Thank you for your business!</p>
            
            <p style="font-size: 16px; color: #333;">
              Best regards,<br>
              Ownly Studio Team
            </p>
          </div>
          
          <div style="background: #e9ecef; padding: 20px; text-align: center; font-size: 14px; color: #666;">
            <p>Ownly Studio | hello@ownly.studio | https://ownly.studio</p>
          </div>
        </div>
      `,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `invoice-${invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("SendGrid error:", error);
    return false;
  }
}