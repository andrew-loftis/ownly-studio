import { Metadata } from 'next';
import ProjectManagement from './components/ProjectManagement';

export const metadata: Metadata = {
  title: 'Project Management - Ownly Studio Admin',
  description: 'Comprehensive project management and tracking dashboard',
};

export default function ProjectsPage() {
  return <ProjectManagement />;
}