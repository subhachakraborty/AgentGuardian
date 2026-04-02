import { TopNav } from '../components/layout/TopNav';
import { StatsBar } from '../components/dashboard/StatsBar';
import { NudgeAlert } from '../components/dashboard/NudgeAlert';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { StepUpModal } from '../components/dashboard/StepUpModal';
import { usePushNotifications } from '../hooks/usePushNotifications';

export function Dashboard() {
  usePushNotifications();

  return (
    <>
      <TopNav title="Dashboard" subtitle="Real-time overview of all agent activity" />
      <div className="p-8 space-y-6">
        {/* Stats */}
        <StatsBar />

        {/* Pending Nudge Alerts */}
        <NudgeAlert />

        {/* Activity Feed */}
        <ActivityFeed />
      </div>

      {/* Step-Up MFA Modal (renders as overlay when triggered) */}
      <StepUpModal />
    </>
  );
}
