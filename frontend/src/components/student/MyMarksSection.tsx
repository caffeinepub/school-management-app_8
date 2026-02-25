import { useAuth } from '../../hooks/useAuth';
import { useGetMarksByStudent, useGetSemesters } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

function getGrade(pct: number) {
  if (pct >= 90) return { label: 'A+', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
  if (pct >= 80) return { label: 'A', color: 'text-green-500', bg: 'bg-green-50 border-green-200' };
  if (pct >= 70) return { label: 'B', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' };
  if (pct >= 60) return { label: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
  if (pct >= 50) return { label: 'D', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' };
  return { label: 'F', color: 'text-red-500', bg: 'bg-red-50 border-red-200' };
}

export default function MyMarksSection() {
  const studentId = useAuth((s) => s.studentId);
  const principal = studentId ? Principal.fromText(studentId) : null;
  const { data: marks, isLoading } = useGetMarksByStudent(principal);
  const { data: semesters } = useGetSemesters();

  const semesterMap = new Map(semesters?.map((s) => [s.id.toString(), s.name]) || []);

  // Group by semester
  const bySemester = new Map<string, typeof marks>();
  marks?.forEach((mark) => {
    const key = mark.semester.toString();
    if (!bySemester.has(key)) bySemester.set(key, []);
    bySemester.get(key)!.push(mark);
  });

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <BookOpen className="w-5 h-5 text-school-gold" />
            My Marks
            {marks && <Badge variant="secondary">{marks.length} subjects</Badge>}
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
            <div className="space-y-6">
              {Array.from(bySemester.entries()).map(([semId, semMarks]) => (
                <div key={semId}>
                  <h3 className="font-semibold text-school-navy mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-school-gold inline-block" />
                    {semesterMap.get(semId) || `Semester ${semId}`}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {semMarks?.map((mark, idx) => {
                      const pct = mark.maxScore > BigInt(0)
                        ? Math.round((Number(mark.score) / Number(mark.maxScore)) * 100)
                        : 0;
                      const grade = getGrade(pct);
                      return (
                        <div key={idx} className={`p-4 rounded-lg border ${grade.bg}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-school-navy text-sm">{mark.subject}</p>
                              <p className="text-school-navy/50 text-xs mt-0.5">
                                {mark.score.toString()} / {mark.maxScore.toString()} marks
                              </p>
                            </div>
                            <span className={`text-2xl font-bold ${grade.color}`}>{grade.label}</span>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-white/60 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${pct >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className={`text-xs mt-1 font-medium ${grade.color}`}>{pct}%</p>
                          </div>
                        </div>
                      );
                    })}
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
