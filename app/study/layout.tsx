import { AppShell } from '@/components/layout/AppShell';
import { MOCK_USER } from '@/lib/mock-data';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell initialUser={MOCK_USER}>{children}</AppShell>;
}
