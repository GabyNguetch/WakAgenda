import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { TabEditorArea } from './TabEditorArea';
import { OnboardingTour, TourRelaunchButton } from '../features/OnBoardingTour';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar (desktop) + Bottom Nav (mobile) */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />
        <TabBar />
        <TabEditorArea>{children}</TabEditorArea>
      </div>

      {/* Onboarding tour — shown once to new users */}
      <OnboardingTour />

      {/* Floating button to relaunch the tour */}
      <TourRelaunchButton />
    </div>
  );
}