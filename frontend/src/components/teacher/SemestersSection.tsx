import { useState } from 'react';
import { useGetSemesters, useAddSemester, useGetAllStudents, useAddSemesterExamResult } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Award, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function nanoToDate(nano: bigint): string {
  return new Date(Number(nano / BigInt(1_000_000))).toLocaleDateString();
}

export default function SemestersSection() {
  const { data: semesters, isLoading: semLoading } = useGetSemesters();
  const { data: students } = useGetAllStudents();
  const addSemester = useAddSemester();
  const addExamResult = useAddSemesterExamResult();

  // Semester form
  const [semName, setSemName] = useState('');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');
  const [semSuccess, setSemSuccess] = useState('');
  const [semError, setSemError] = useState('');

  // Exam result form
  const [studentId, setStudentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [examSuccess, setExamSuccess] = useState('');
  const [examError, setExamError] = useState('');

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setSemError('');
    setSemSuccess('');
    if (!semName.trim() || !semStart || !semEnd) {
      setSemError('All fields are required.');
      return;
    }
    try {
      await addSemester.mutateAsync({
        name: semName.trim(),
        startDate: dateToNano(semStart),
        endDate: dateToNano(semEnd),
      });
      setSemSuccess(`Semester "${semName}" added!`);
      setSemName('');
      setSemStart('');
      setSemEnd('');
    } catch (e: any) {
      setSemError(e?.message || 'Failed to add semester.');
    }
  };

  const handleAddExamResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamError('');
    setExamSuccess('');
    if (!studentId || !semesterId || !subject.trim() || !score || !maxScore) {
      setExamError('All fields are required.');
      return;
    }
    const student = students?.find((s) => s.id.toString() === studentId);
    if (!student) { setExamError('Student not found.'); return; }

    try {
      await addExamResult.mutateAsync({
        studentId: student.id as Principal,
        semesterId: BigInt(semesterId),
        subject: subject.trim(),
        score: BigInt(score),
        maxScore: BigInt(maxScore),
      });
      setExamSuccess('Exam result added!');
      setStudentId('');
      setSubject('');
      setScore('');
    } catch (e: any) {
      setExamError(e?.message || 'Failed to add exam result.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Semester */}
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Plus className="w-5 h-5 text-school-gold" />
            Add New Semester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSemester} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Semester Name</Label>
              <Input
                placeholder="e.g. Spring 2026"
                value={semName}
                onChange={(e) => setSemName(e.target.value)}
                className="border-school-navy/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Start Date</Label>
              <input
                type="date"
                value={semStart}
                onChange={(e) => setSemStart(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-school-navy/20 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-school-gold/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">End Date</Label>
              <input
                type="date"
                value={semEnd}
                onChange={(e) => setSemEnd(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-school-navy/20 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-school-gold/40"
              />
            </div>
            <div className="sm:col-span-3 flex flex-col gap-3">
              {semError && <Alert variant="destructive"><AlertDescription>{semError}</AlertDescription></Alert>}
              {semSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription>{semSuccess}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="bg-school-navy hover:bg-school-navy/90 text-white w-fit"
                disabled={addSemester.isPending}
              >
                {addSemester.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Add Semester</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Semesters List */}
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Award className="w-5 h-5 text-school-gold" />
            Semesters
            {semesters && <Badge variant="secondary">{semesters.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {semLoading ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !semesters || semesters.length === 0 ? (
            <p className="text-school-navy/40 text-sm text-center py-6">No semesters added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-school-navy/10">
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Start</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">End</th>
                  </tr>
                </thead>
                <tbody>
                  {semesters.map((sem) => (
                    <tr key={sem.id.toString()} className="border-b border-school-navy/5 hover:bg-school-navy/2">
                      <td className="py-3 px-4 text-school-navy/40">{sem.id.toString()}</td>
                      <td className="py-3 px-4 font-medium text-school-navy">{sem.name}</td>
                      <td className="py-3 px-4 text-school-navy/70">{nanoToDate(sem.startDate)}</td>
                      <td className="py-3 px-4 text-school-navy/70">{nanoToDate(sem.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Exam Result */}
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Plus className="w-5 h-5 text-school-gold" />
            Add Semester Exam Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExamResult} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Label className="text-school-navy/70 text-sm">Subject</Label>
              <Input
                placeholder="e.g. Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-school-navy/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Score</Label>
              <Input
                type="number"
                placeholder="e.g. 78"
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
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-3">
              {examError && <Alert variant="destructive"><AlertDescription>{examError}</AlertDescription></Alert>}
              {examSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription>{examSuccess}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="bg-school-navy hover:bg-school-navy/90 text-white w-fit"
                disabled={addExamResult.isPending}
              >
                {addExamResult.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Add Result</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
