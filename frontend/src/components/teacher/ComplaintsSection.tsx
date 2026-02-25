import { useGetAllComplaints, useGetAllStudents } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

function nanoToDateTime(nano: bigint): string {
  return new Date(Number(nano / BigInt(1_000_000))).toLocaleString();
}

export default function ComplaintsSection() {
  const { data: complaints, isLoading } = useGetAllComplaints();
  const { data: students } = useGetAllStudents();

  const studentMap = new Map(students?.map((s) => [s.id.toString(), s.name]) || []);

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <MessageSquare className="w-5 h-5 text-school-gold" />
            Student Complaints
            {complaints && <Badge variant="secondary">{complaints.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : !complaints || complaints.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No complaints submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...complaints].sort((a, b) => Number(b.timestamp - a.timestamp)).map((complaint) => (
                <div key={complaint.id.toString()} className="p-4 rounded-lg border border-school-navy/10 bg-white hover:border-school-gold/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-school-navy/10 flex items-center justify-center text-school-navy font-bold text-sm">
                        {(studentMap.get(complaint.studentId.toString()) || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-school-navy text-sm">
                          {studentMap.get(complaint.studentId.toString()) || 'Unknown Student'}
                        </p>
                        <p className="text-school-navy/40 text-xs">{nanoToDateTime(complaint.timestamp)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-school-navy/20 text-school-navy/50 flex-shrink-0">
                      #{complaint.id.toString()}
                    </Badge>
                  </div>
                  <p className="text-school-navy/70 text-sm leading-relaxed pl-10">{complaint.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
