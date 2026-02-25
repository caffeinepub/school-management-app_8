import { useState } from 'react';
import { useGetAllStudents, useCreateStudent } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Loader2, CheckCircle2 } from 'lucide-react';

export default function StudentsSection() {
  const { data: students, isLoading } = useGetAllStudents();
  const createStudent = useCreateStudent();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    try {
      await createStudent.mutateAsync({ name: name.trim(), username: username.trim(), password });
      setSuccess(`Student "${name}" created successfully!`);
      setName('');
      setUsername('');
      setPassword('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create student.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Student Form */}
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <UserPlus className="w-5 h-5 text-school-gold" />
            Create New Student Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Full Name</Label>
              <Input
                placeholder="e.g. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-school-navy/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Username</Label>
              <Input
                placeholder="e.g. john.smith"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-school-navy/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-school-navy/70 text-sm">Password</Label>
              <Input
                type="password"
                placeholder="Set a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-school-navy/20"
              />
            </div>
            <div className="sm:col-span-3 flex flex-col gap-3">
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
                disabled={createStudent.isPending}
              >
                {createStudent.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Create Student</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="border-school-navy/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-school-navy text-lg">
            <Users className="w-5 h-5 text-school-gold" />
            All Students
            {students && <Badge variant="secondary" className="ml-2">{students.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !students || students.length === 0 ? (
            <div className="text-center py-10 text-school-navy/40">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No students yet. Create the first student account above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-school-navy/10">
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">#</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Username</th>
                    <th className="text-left py-3 px-4 text-school-navy/60 font-semibold">Principal ID</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id.toString()} className="border-b border-school-navy/5 hover:bg-school-navy/2 transition-colors">
                      <td className="py-3 px-4 text-school-navy/40">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-school-navy">{student.name}</td>
                      <td className="py-3 px-4 text-school-navy/70">{student.username}</td>
                      <td className="py-3 px-4 text-school-navy/40 font-mono text-xs truncate max-w-[160px]">
                        {student.id.toString()}
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
