import { useState } from 'react';
import { useSubmitComplaint } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function ComplaintBoxSection() {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const submitComplaint = useSubmitComplaint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!message.trim()) {
      setError('Please write your complaint before submitting.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Complaint must be at least 10 characters long.');
      return;
    }
    try {
      await submitComplaint.mutateAsync(message.trim());
      setSuccess('Your complaint has been submitted successfully. The teacher will review it.');
      setMessage('');
    } catch (e: any) {
      setError(e?.message || 'Failed to submit complaint. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <MessageSquare className="w-5 h-5 text-school-gold" />
            Complaint Box
          </CardTitle>
          <CardDescription>
            Submit a complaint or concern to your teacher. Your message will be reviewed confidentially.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Textarea
                placeholder="Describe your complaint or concern in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-school-navy/20 resize-none min-h-[160px] focus:border-school-gold/50"
                rows={6}
              />
              <p className="text-xs text-school-navy/40 text-right">
                {message.length} characters {message.length < 10 && message.length > 0 ? '(min 10)' : ''}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="bg-school-navy hover:bg-school-navy/90 text-white gap-2"
              disabled={submitComplaint.isPending || message.trim().length < 10}
            >
              {submitComplaint.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Complaint</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-school-gold/20 bg-school-gold/5 shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-school-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-school-navy/60" />
            </div>
            <div>
              <p className="font-semibold text-school-navy text-sm mb-1">How it works</p>
              <ul className="text-school-navy/60 text-sm space-y-1 list-disc list-inside">
                <li>Your complaint is submitted anonymously to the teacher</li>
                <li>Only the teacher can view submitted complaints</li>
                <li>You cannot view previously submitted complaints</li>
                <li>Be respectful and provide clear details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
