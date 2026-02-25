import { useState } from 'react';
import { useGetAllStudents, useGetAllMarks, useAddMark, useUpdateMark, useGetSemesters } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

export default function MarksSection() {
  const { data: students } = useGetAllStudents();
  const { data: marks, isLoading } = useGetAllMarks();
  const { data: semesters } = useGetSemesters();
  const addMark = useAddMark();
  const updateMark = useUpdateMark();

  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [semesterId, setSemesterId] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!studentId || !subject.trim() || !score || !maxScore || !semesterId) {
      setError('All fields are required.');
      return;
    }
    const student = students?.find((s) => s.id.toString() === studentId);
    if (!student) { setError('Student not found.'); return; }

    try {
      const params = {
        studentId: student.id as Principal,
        subject: subject.trim(),
        score: BigInt(score),
        maxScore: BigInt(maxScore),
        semester: BigInt(semesterId),
      };
      if (isUpdate) {
        await updateMark.mutateAsync(params);
        setSuccess('Mark updated successfully!');
      } else {
        await addMark.mutateAsync(params);
        setSuccess('Mark added successfully!');
      }
      setStudentId('');
      setSubject('');
      setScore('');
    } catch (e: any) {
      setError(e?.message || 'Operation failed.');
    }
  };

  const studentMap = new Map(students?.map((s) => [s.id.toString(), s.name]) || []);
  const semesterMap = new Map(semesters?.map((s) => [s.id.toString(), s.name]) || []);

  const getPercentage = (score: bigint, max: bigint) => {
    if (max === BigInt(0)) return 0;
    return Math.round((Number(score) / Number(max)) * 100);
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: 'text-green-600' };
    if (pct >= 80) return { label: 'A', color: 'text-green-500' };
    if (pct >= 70) return { label: 'B', color: 'text-blue-500' };
    if (pct >= 60) return { label: 'C', color: 'text-yellow-600' };
    if (pct >= 50) return { label: 'D', color: 'text-orange-500' };
    return { label: 'F', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Plus className="w-5 h-5 text-school-gold" />
            Enter Marks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Label className="text-school-navy/70 text-sm">Subject</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-school-navy/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Semester</Label>
              <Select value={semesterId} onValueChange={setSemesterId}>
                <SelectTrigger className="border-school-navy/20">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters?.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Score</Label>
              <Input
                type="number"
                placeholder="e.g. 85"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0"
                className="border-school-navy/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Max Score</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                min="1"
                className="border-school-navy/20"
              />
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
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-3">
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
                disabled={addMark.isPending || updateMark.isPending}
              >
                {(addMark.isPending || updateMark.isPending) ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  isUpdate ? 'Update Mark' : 'Add Mark'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <BookOpen className="w-5 h-5 text-school-gold" />
            All Marks
            {marks && <Badge variant="secondary">{marks.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !marks || marks.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No marks recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-school-navy/10">
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Subject</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Semester</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Score</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((mark, idx) => {
                    const pct = getPercentage(mark.score, mark.maxScore);
                    const grade = getGrade(pct);
                    return (
                      <tr key={idx} className="border-b border-school-navy/5 hover:bg-school-navy/2">
                        <td className="py-3 px-4 font-medium text-school-navy">
                          {studentMap.get(mark.studentId.toString()) || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-school-navy/70">{mark.subject}</td>
                        <td className="py-3 px-4 text-school-navy/60">
                          {semesterMap.get(mark.semester.toString()) || `Sem ${mark.semester}`}
                        </td>
                        <td className="py-3 px-4 text-school-navy/70">
                          {mark.score.toString()}/{mark.maxScore.toString()} ({pct}%)
                        </td>
                        <td className={`py-3 px-4 font-bold ${grade.color}`}>{grade.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
