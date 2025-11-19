import { Metadata } from 'next';
import AdminDashboard from './components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Ownly Studio',
  description: 'Comprehensive business intelligence and management dashboard',
};

export default function AdminPage() {
  return <AdminDashboard />;
}