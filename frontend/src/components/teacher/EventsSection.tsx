import { useState } from 'react';
import { useGetAllEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Calendar, Plus, Pencil, Trash2, Loader2, CheckCircle2, X } from 'lucide-react';

function nanoToDateInput(nano: bigint): string {
  const d = new Date(Number(nano / BigInt(1_000_000)));
  return d.toISOString().split('T')[0];
}

function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export default function EventsSection() {
  const { data: events, isLoading } = useGetAllEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title.trim() || !date) {
      setError('Title and date are required.');
      return;
    }
    const dateNano = dateToNano(date);
    try {
      if (editingId !== null) {
        await updateEvent.mutateAsync({ id: editingId, title: title.trim(), description: description.trim(), date: dateNano });
        setSuccess('Event updated!');
      } else {
        await createEvent.mutateAsync({ title: title.trim(), description: description.trim(), date: dateNano });
        setSuccess('Event created!');
      }
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Operation failed.');
    }
  };

  const handleEdit = (event: { id: bigint; title: string; description: string; date: bigint }) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(nanoToDateInput(event.date));
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteEvent.mutateAsync(id);
      setSuccess('Event deleted.');
    } catch (e: any) {
      setError(e?.message || 'Delete failed.');
    }
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Plus className="w-5 h-5 text-school-gold" />
            {editingId !== null ? 'Edit Event' : 'Create Event'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-school-navy/70 text-sm">Event Title</Label>
                <Input
                  placeholder="e.g. Annual Sports Day"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-school-navy/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-school-navy/70 text-sm">Date</Label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-school-navy/20 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-school-gold/40"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Description</Label>
              <Textarea
                placeholder="Event details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-school-navy/20 resize-none"
                rows={3}
              />
            </div>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-school-navy hover:bg-school-navy/90 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : editingId !== null ? (
                  <><Pencil className="w-4 h-4 mr-2" /> Update Event</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Create Event</>
                )}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={resetForm} className="border-school-navy/20">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Calendar className="w-5 h-5 text-school-gold" />
            All Events
            {events && <Badge variant="secondary">{events.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No events yet. Create the first event above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...events].sort((a, b) => Number(b.date - a.date)).map((event) => (
                <div key={event.id.toString()} className="flex items-start gap-4 p-4 rounded-lg border border-school-navy/10 hover:border-school-gold/30 transition-colors bg-white">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-school-gold/10 flex flex-col items-center justify-center text-school-navy">
                    <span className="text-xs font-bold">
                      {new Date(Number(event.date / BigInt(1_000_000))).toLocaleDateString('en', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {new Date(Number(event.date / BigInt(1_000_000))).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-school-navy">{event.title}</h4>
                    {event.description && (
                      <p className="text-school-navy/60 text-sm mt-0.5 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-school-navy/50 hover:text-school-navy hover:bg-school-navy/5"
                      onClick={() => handleEdit(event)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{event.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(event.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
