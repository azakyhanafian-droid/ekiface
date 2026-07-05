import { EventToolbar } from '@/components/event-log/event-toolbar';
import { TimelineCards } from '@/components/event-log/timeline-cards';

export const metadata = {
  title: 'Event Log - NeoGuard',
  description: 'AI detection events and safety violations',
};

export default function EventLogPage() {
  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Event Log</h1>
        <p className="text-muted-foreground mt-1">AI detection results and safety violations</p>
      </div>

      {/* Toolbar */}
      <EventToolbar />

      {/* Timeline Cards */}
      <TimelineCards />
    </div>
  );
}
