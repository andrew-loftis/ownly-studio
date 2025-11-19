import Stripe from "stripe";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

interface ProductConfig {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // in dollars
  features: string[];
}

const PRODUCTS: ProductConfig[] = [
  {
    id: "starter",
    name: "Starter Plan",
    description: "Perfect for small businesses getting started online",
    monthlyPrice: 99,
    features: [
      "Custom Website Design",
      "Content Management System", 
      "Mobile Responsive",
      "Basic SEO Setup",
      "1 Month Support"
    ]
  },
  {
    id: "professional", 
    name: "Professional Plan",
    description: "Advanced features for growing businesses",
    monthlyPrice: 299,
    features: [
      "Everything in Starter",
      "Web Application Development",
      "Payment Integration",
      "Advanced Analytics",
      "API Integration",
      "3 Months Support"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise Plan", 
    description: "Full-scale solutions for established companies",
    monthlyPrice: 599,
    features: [
      "Everything in Professional",
      "Custom Backend Development",
      "Database Architecture",
      "Third-party Integrations",
      "DevOps & Deployment",
      "6 Months Support",
      "Priority Support"
    ]
  }
];

async function createStripeProducts() {
  console.log("🚀 Setting up Stripe products and prices...\n");
  
  const priceIds: { [key: string]: string } = {};
  
  for (const productConfig of PRODUCTS) {
    try {
      console.log(`📦 Creating product: ${productConfig.name}`);
      
      // Create the product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: {
          plan_id: productConfig.id,
          features: JSON.stringify(productConfig.features)
        }
      });
      
      console.log(`   ✅ Product created: ${product.id}`);
      
      // Create the monthly price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: productConfig.monthlyPrice * 100, // Convert to cents
        currency: "usd",
        recurring: {
          interval: "month"
        },
        metadata: {
          plan_id: productConfig.id
        }
      });
      
      console.log(`   💰 Price created: ${price.id} ($${productConfig.monthlyPrice}/month)`);
      
      priceIds[`STRIPE_${productConfig.id.toUpperCase()}_PRICE_ID`] = price.id;
      
    } catch (error: any) {
      console.error(`❌ Error creating ${productConfig.name}:`, error.message);
    }
    
    console.log(); // Empty line for readability
  }
  
  // Output environment variables
  console.log("🔧 Add these environment variables to your .env.local and Netlify:\n");
  
  Object.entries(priceIds).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log("\n📋 Netlify commands to run:");
  Object.entries(priceIds).forEach(([key, value]) => {
    console.log(`netlify env:set ${key} "${value}"`);
  });
  
  console.log("\n✨ Setup complete! Your Stripe products are ready.");
  
  return priceIds;
}

// Run the setup
createStripeProducts().catch(console.error);