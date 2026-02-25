import { useGetAllEvents } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function StudentEventsSection() {
  const { data: events, isLoading } = useGetAllEvents();

  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const upcoming = events?.filter((e) => e.date >= now) || [];
  const past = events?.filter((e) => e.date < now) || [];

  const EventCard = ({ event }: { event: { id: bigint; title: string; description: string; date: bigint } }) => {
    const d = new Date(Number(event.date / BigInt(1_000_000)));
    const isPast = event.date < now;
    return (
      <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${isPast ? 'border-school-navy/5 bg-school-navy/2 opacity-70' : 'border-school-navy/10 bg-white hover:border-school-gold/30'}`}>
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center ${isPast ? 'bg-school-navy/5' : 'bg-school-gold/10'}`}>
          <span className="text-xs font-bold text-school-navy/60">
            {d.toLocaleDateString('en', { month: 'short' })}
          </span>
          <span className="text-lg font-bold text-school-navy leading-none">{d.getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-school-navy">{event.title}</h4>
            {!isPast && <Badge className="bg-school-gold/20 text-school-navy border-school-gold/30 text-xs" variant="outline">Upcoming</Badge>}
          </div>
          {event.description && (
            <p className="text-school-navy/60 text-sm mt-0.5">{event.description}</p>
          )}
          <p className="text-school-navy/40 text-xs mt-1">{d.toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Calendar className="w-5 h-5 text-school-gold" />
            School Events
            {events && <Badge variant="secondary">{events.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No events scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-school-navy/60 uppercase tracking-wider mb-3">Upcoming</h3>
                  <div className="space-y-2">
                    {[...upcoming].sort((a, b) => Number(a.date - b.date)).map((e) => <EventCard key={e.id.toString()} event={e} />)}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-school-navy/60 uppercase tracking-wider mb-3">Past Events</h3>
                  <div className="space-y-2">
                    {[...past].sort((a, b) => Number(b.date - a.date)).map((e) => <EventCard key={e.id.toString()} event={e} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
