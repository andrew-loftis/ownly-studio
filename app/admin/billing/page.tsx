import { Metadata } from 'next';
import BillingManagement from './components/BillingManagement';

export const metadata: Metadata = {
  title: 'Billing & Finance - Ownly Studio Admin',
  description: 'Comprehensive billing, invoicing, and financial management dashboard',
};

export default function BillingPage() {
  return <BillingManagement />;
}