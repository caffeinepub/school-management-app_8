import { useAuth } from '../../hooks/useAuth';
import { useGetSemesterExamResultsByStudent, useGetSemesters } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

function getGrade(pct: number) {
  if (pct >= 90) return { label: 'A+', color: 'text-green-600' };
  if (pct >= 80) return { label: 'A', color: 'text-green-500' };
  if (pct >= 70) return { label: 'B', color: 'text-blue-500' };
  if (pct >= 60) return { label: 'C', color: 'text-yellow-600' };
  if (pct >= 50) return { label: 'D', color: 'text-orange-500' };
  return { label: 'F', color: 'text-red-500' };
}

export default function MySemesterResultsSection() {
  const studentId = useAuth((s) => s.studentId);
  const principal = studentId ? Principal.fromText(studentId) : null;
  const { data: results, isLoading } = useGetSemesterExamResultsByStudent(principal);
  const { data: semesters } = useGetSemesters();

  const semesterMap = new Map(semesters?.map((s) => [s.id.toString(), s.name]) || []);

  // Group by semester
  const bySemester = new Map<string, typeof results>();
  results?.forEach((r) => {
    const key = r.semesterId.toString();
    if (!bySemester.has(key)) bySemester.set(key, []);
    bySemester.get(key)!.push(r);
  });

  return (
    <div className="space-y-6">
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Award className="w-5 h-5 text-school-gold" />
            My Semester Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !results || results.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No exam results available yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(bySemester.entries()).map(([semId, semResults]) => {
                const totalScore = semResults?.reduce((acc, r) => acc + Number(r.score), 0) || 0;
                const totalMax = semResults?.reduce((acc, r) => acc + Number(r.maxScore), 0) || 0;
                const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
                const overallGrade = getGrade(overallPct);

                return (
                  <div key={semId}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-school-navy text-base flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-school-gold inline-block" />
                        {semesterMap.get(semId) || `Semester ${semId}`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-school-navy/50 text-sm">{overallPct}% overall</span>
                        <span className={`font-bold text-lg ${overallGrade.color}`}>{overallGrade.label}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-school-navy/10">
                            <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Subject</th>
                            <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Score</th>
                            <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Percentage</th>
                            <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResults?.map((result, idx) => {
                            const pct = result.maxScore > BigInt(0)
                              ? Math.round((Number(result.score) / Number(result.maxScore)) * 100)
                              : 0;
                            const grade = getGrade(pct);
                            return (
                              <tr key={idx} className="border-b border-school-navy/5 hover:bg-school-navy/2">
                                <td className="py-3 px-4 font-medium text-school-navy">{result.subject}</td>
                                <td className="py-3 px-4 text-school-navy/70">
                                  {result.score.toString()} / {result.maxScore.toString()}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-school-navy/10 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full ${pct >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className="text-school-navy/60">{pct}%</span>
                                  </div>
                                </td>
                                <td className={`py-3 px-4 font-bold ${grade.color}`}>{grade.label}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
