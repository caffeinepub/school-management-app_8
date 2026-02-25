import { useState } from 'react';
import { useGetAllStudents, useGetAttendanceAll, useAddAttendance, useUpdateAttendance } from '../../hooks/useQueries';
import { AttendanceStatus } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function nanoToDate(nano: bigint): string {
  return new Date(Number(nano / BigInt(1_000_000))).toLocaleDateString();
}

export default function AttendanceSection() {
  const { data: students } = useGetAllStudents();
  const { data: attendance, isLoading } = useGetAttendanceAll();
  const addAttendance = useAddAttendance();
  const updateAttendance = useUpdateAttendance();

  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [isUpdate, setIsUpdate] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!studentId || !date) {
      setError('Please select a student and date.');
      return;
    }
    const student = students?.find((s) => s.id.toString() === studentId);
    if (!student) { setError('Student not found.'); return; }

    const dateNano = dateToNano(date);
    const attStatus = status === 'present' ? AttendanceStatus.present : AttendanceStatus.absent;

    try {
      if (isUpdate) {
        await updateAttendance.mutateAsync({ studentId: student.id as Principal, date: dateNano, status: attStatus });
        setSuccess('Attendance updated successfully!');
      } else {
        await addAttendance.mutateAsync({ studentId: student.id as Principal, date: dateNano, status: attStatus });
        setSuccess('Attendance added successfully!');
      }
      setStudentId('');
      setDate('');
    } catch (e: any) {
      setError(e?.message || 'Operation failed.');
    }
  };

  const studentMap = new Map(students?.map((s) => [s.id.toString(), s.name]) || []);

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Plus className="w-5 h-5 text-school-gold" />
            Record Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="border-school-navy/20">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'present' | 'absent')}>
                <SelectTrigger className="border-school-navy/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Action</Label>
              <Select value={isUpdate ? 'update' : 'add'} onValueChange={(v) => setIsUpdate(v === 'update')}>
                <SelectTrigger className="border-school-navy/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add New</SelectItem>
                  <SelectItem value="update">Update Existing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-3">
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="bg-school-navy hover:bg-school-navy/90 text-white w-fit"
                disabled={addAttendance.isPending || updateAttendance.isPending}
              >
                {(addAttendance.isPending || updateAttendance.isPending) ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  isUpdate ? 'Update Attendance' : 'Add Attendance'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <ClipboardList className="w-5 h-5 text-school-gold" />
            Attendance Records
            {attendance && <Badge variant="secondary">{attendance.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !attendance || attendance.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No attendance records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-school-navy/10">
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...attendance].sort((a, b) => Number(b.date - a.date)).map((rec, idx) => (
                    <tr key={idx} className="border-b border-school-navy/5 hover:bg-school-navy/2">
                      <td className="py-3 px-4 font-medium text-school-navy">
                        {studentMap.get(rec.studentId.toString()) || rec.studentId.toString().slice(0, 12) + '...'}
                      </td>
                      <td className="py-3 px-4 text-school-navy/70">{nanoToDate(rec.date)}</td>
                      <td className="py-3 px-4">
                        <Badge className={rec.status === AttendanceStatus.present
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                        } variant="outline">
                          {rec.status === AttendanceStatus.present ? 'Present' : 'Absent'}
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
