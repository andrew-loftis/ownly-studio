import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/server/firebaseAuth';
import { runQuery, addDocument, fs } from '@/lib/server/firestoreRest';

interface SubscriptionDoc {
  id: string;
  orgId: string;
  customerId: string;
  subscriptionId: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  plan: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyFirebaseIdToken(idToken);
    
    // Check if user has site staff permissions
    const isSiteStaff = decodedToken.admin === true || 
                       decodedToken.siteRole === 'superadmin' || 
                       decodedToken.siteRole === 'staff' ||
                       decodedToken.email?.endsWith('@ownly.studio') ||
                       decodedToken.email?.includes('aloft') ||
                       decodedToken.email === 'andrew@houseofkna.com';

    if (!isSiteStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build collection group query for subscriptions
    let query: any = {
      from: [{ collectionGroup: 'subscriptions' }],
      orderBy: [{ field: { fieldPath: 'updatedAt' }, direction: 'DESCENDING' }],
      limit: limit
    };

    // Add filters
    const filters: any[] = [];
    
    if (orgId) {
      filters.push({
        fieldFilter: {
          field: { fieldPath: 'orgId' },
          op: 'EQUAL',
          value: { stringValue: orgId }
        }
      });
    }

    if (status) {
      filters.push({
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL', 
          value: { stringValue: status }
        }
      });
    }

    if (filters.length > 0) {
      if (filters.length === 1) {
        query.where = filters[0];
      } else {
        query.where = {
          compositeFilter: {
            op: 'AND',
            filters: filters
          }
        };
      }
    }

    const response = await runQuery(query, idToken);
    
    const subscriptions: SubscriptionDoc[] = response.map((doc: any) => {
      const data = doc.document.fields;
      return {
        id: doc.document.name.split('/').pop(),
        orgId: data.orgId?.stringValue || '',
        customerId: data.customerId?.stringValue || '',
        subscriptionId: data.subscriptionId?.stringValue || '',
        status: data.status?.stringValue || 'inactive',
        plan: data.plan?.stringValue || '',
        amount: parseInt(data.amount?.integerValue || data.amount?.doubleValue || '0'),
        currency: data.currency?.stringValue || 'usd',
        interval: data.interval?.stringValue || 'monthly',
        currentPeriodStart: data.currentPeriodStart?.timestampValue || data.currentPeriodStart?.stringValue || '',
        currentPeriodEnd: data.currentPeriodEnd?.timestampValue || data.currentPeriodEnd?.stringValue || '',
        cancelAtPeriodEnd: data.cancelAtPeriodEnd?.booleanValue || false,
        trialEnd: data.trialEnd?.timestampValue || data.trialEnd?.stringValue,
        createdAt: data.createdAt?.timestampValue || data.createdAt?.stringValue || new Date().toISOString(),
        updatedAt: data.updatedAt?.timestampValue || data.updatedAt?.stringValue || new Date().toISOString(),
        metadata: data.metadata?.mapValue?.fields || {}
      };
    });

    // Calculate metrics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const monthlyRevenue = activeSubscriptions
      .filter(s => s.interval === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0);
    const yearlyRevenue = activeSubscriptions
      .filter(s => s.interval === 'yearly')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalMRR = monthlyRevenue + (yearlyRevenue / 12);

    const metrics = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      monthlyRevenue,
      yearlyRevenue,
      totalMRR: Math.round(totalMRR),
      churnRate: subscriptions.filter(s => s.status === 'canceled').length / Math.max(subscriptions.length, 1),
      averageAmount: subscriptions.length > 0 ? Math.round(subscriptions.reduce((sum, s) => sum + s.amount, 0) / subscriptions.length) : 0
    };

    return NextResponse.json({ subscriptions, metrics });

  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyFirebaseIdToken(idToken);
    
    // Check if user has site staff permissions (subscriptions are admin-only)
    const isSiteStaff = decodedToken.admin === true || 
                       decodedToken.siteRole === 'superadmin' || 
                       decodedToken.siteRole === 'staff' ||
                       decodedToken.email?.endsWith('@ownly.studio') ||
                       decodedToken.email?.includes('aloft') ||
                       decodedToken.email === 'andrew@houseofkna.com';

    if (!isSiteStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { orgId, customerId, subscriptionId, status, plan, amount, currency, interval, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, trialEnd, metadata } = body;

    if (!orgId || !subscriptionId || !status) {
      return NextResponse.json({ error: 'Missing required fields: orgId, subscriptionId, status' }, { status: 400 });
    }

    const now = new Date();
    const subscriptionFields = {
      orgId: fs.string(orgId),
      customerId: fs.string(customerId || ''),
      subscriptionId: fs.string(subscriptionId),
      status: fs.string(status),
      plan: fs.string(plan || ''),
      amount: fs.number(amount || 0),
      currency: fs.string(currency || 'usd'),
      interval: fs.string(interval || 'monthly'),
      currentPeriodStart: fs.string(currentPeriodStart || now.toISOString()),
      currentPeriodEnd: fs.string(currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
      cancelAtPeriodEnd: fs.bool(cancelAtPeriodEnd || false),
      trialEnd: trialEnd ? fs.string(trialEnd) : undefined,
      createdAt: fs.timestamp(now),
      updatedAt: fs.timestamp(now),
      metadata: metadata ? fs.string(JSON.stringify(metadata)) : undefined
    };

    // Remove undefined fields
    Object.keys(subscriptionFields).forEach(k => (subscriptionFields as any)[k] === undefined && delete (subscriptionFields as any)[k]);

    const newSubscription = await addDocument(`orgs/${orgId}`, 'subscriptions', subscriptionFields, idToken);
    const docId = newSubscription.name.split('/').pop();

    return NextResponse.json({ 
      id: docId,
      orgId,
      subscriptionId,
      status,
      plan: plan || '',
      amount: amount || 0,
      currency: currency || 'usd',
      interval: interval || 'monthly'
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}