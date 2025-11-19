import { Metadata } from 'next';
import ClientsManagement from './components/ClientsManagement';

export const metadata: Metadata = {
  title: 'Client Management - Ownly Studio Admin',
  description: 'Comprehensive client relationship management dashboard',
};

export default function ClientsPage() {
  return <ClientsManagement />;
}