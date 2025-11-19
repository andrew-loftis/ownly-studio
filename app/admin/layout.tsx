import { Metadata } from 'next';
import AdminLayout from './components/AdminLayout';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Ownly Studio',
  description: 'Comprehensive admin backend for managing clients, projects, billing, and business operations',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}