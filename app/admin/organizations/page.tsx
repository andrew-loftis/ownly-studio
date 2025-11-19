import { Metadata } from 'next';
import OrganizationsManagement from './components/OrganizationsManagement';

export const metadata: Metadata = {
  title: 'Organizations - Ownly Studio Admin',
  description: 'Manage organizations, plans, and billing settings',
};

export default function OrganizationsPage() {
  return <OrganizationsManagement />;
}
