import { useAuth } from '../../hooks/useAuth';
import { useGetAttendanceByStudent } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { AttendanceStatus } from '../../backend';

function nanoToDate(nano: bigint): string {
  return new Date(Number(nano / BigInt(1_000_000))).toLocaleDateString();
}

export default function MyAttendanceSection() {
  const studentId = useAuth((s) => s.studentId);
  const principal = studentId ? Principal.fromText(studentId) : null;
  const { data: attendance, isLoading } = useGetAttendanceByStudent(principal);

  const presentCount = attendance?.filter((a) => a.status === AttendanceStatus.present).length || 0;
  const absentCount = attendance?.filter((a) => a.status === AttendanceStatus.absent).length || 0;
  const total = (attendance?.length || 0);
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-school-navy/10 shadow-sm text-center">
          <CardContent className="pt-6 pb-4">
            <p className="text-3xl font-bold text-school-navy">{total}</p>
            <p className="text-school-navy/50 text-sm mt-1">Total Days</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 shadow-sm text-center bg-green-50">
          <CardContent className="pt-6 pb-4">
            <p className="text-3xl font-bold text-green-600">{presentCount}</p>
            <p className="text-green-600/70 text-sm mt-1">Present</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 shadow-sm text-center bg-red-50">
          <CardContent className="pt-6 pb-4">
            <p className="text-3xl font-bold text-red-500">{absentCount}</p>
            <p className="text-red-500/70 text-sm mt-1">Absent</p>
          </CardContent>
        </Card>
      </div>

      {total > 0 && (
        <Card className="border-school-navy/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-school-navy">Attendance Rate</span>
              <span className={`text-sm font-bold ${pct >= 75 ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
            </div>
            <div className="w-full bg-school-navy/10 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct < 75 && (
              <p className="text-red-500 text-xs mt-2">⚠ Attendance below 75% threshold</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <ClipboardList className="w-5 h-5 text-school-gold" />
            Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !attendance || attendance.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-school-navy/10">
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...attendance].sort((a, b) => Number(b.date - a.date)).map((rec, idx) => (
                    <tr key={idx} className="border-b border-school-navy/5 hover:bg-school-navy/2">
                      <td className="py-3 px-4 text-school-navy/70">{nanoToDate(rec.date)}</td>
                      <td className="py-3 px-4">
                        <Badge className={rec.status === AttendanceStatus.present
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                        } variant="outline">
                          {rec.status === AttendanceStatus.present ? '✓ Present' : '✗ Absent'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
