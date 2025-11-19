import { Metadata } from 'next';
import FirebaseInitializer from './components/FirebaseInitializer';

export const metadata: Metadata = {
  title: 'Setup - Ownly Studio Admin',
  description: 'Initialize Firebase data for admin dashboard',
};

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--txt-primary)]">
          Admin Setup
        </h1>
        <p className="text-[var(--txt-secondary)] mt-1">
          Initialize your Firebase collections with sample data
        </p>
      </div>

      <FirebaseInitializer />
    </div>
  );
}