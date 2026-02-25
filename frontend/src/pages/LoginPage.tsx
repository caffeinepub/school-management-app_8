import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useActor } from '../hooks/useActor';
import { useStudentLogin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const setTeacher = useAuth((s) => s.setTeacher);
  const setStudent = useAuth((s) => s.setStudent);
  const studentLoginMutation = useStudentLogin();

  const [tab, setTab] = useState<'teacher' | 'student'>('teacher');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [error, setError] = useState('');
  const [teacherStep, setTeacherStep] = useState<'idle' | 'checking'>('idle');

  const isLoggingIn = loginStatus === 'logging-in';
  const isInitializing = loginStatus === 'initializing';

  const handleTeacherLogin = async () => {
    setError('');
    if (!identity) {
      login();
      return;
    }
    setTeacherStep('checking');
    try {
      if (!actor || actorFetching) {
        setError('Still connecting to backend. Please wait a moment and try again.');
        setTeacherStep('idle');
        return;
      }
      const isAdmin = await actor.isCallerAdmin();
      if (isAdmin) {
        setTeacher();
        navigate({ to: '/teacher/dashboard' });
      } else {
        setError('This account does not have teacher (admin) privileges.');
        await clear();
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please try again.');
    } finally {
      setTeacherStep('idle');
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!studentUsername.trim() || !studentPassword.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    if (!identity) {
      login();
      return;
    }
    try {
      if (!actor || actorFetching) {
        setError('Still connecting to backend. Please wait a moment and try again.');
        return;
      }
      const success = await studentLoginMutation.mutateAsync({
        username: studentUsername,
        password: studentPassword,
      });
      if (success) {
        const profile = await actor.getCallerUserProfile();
        const name = profile?.name || studentUsername;
        const principalStr = identity.getPrincipal().toString();
        setStudent(principalStr, name);
        navigate({ to: '/student/dashboard' });
      } else {
        setError('Invalid username or password.');
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-school-bg flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 school-bg-pattern pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-school-gold/10 border-4 border-school-gold/30 flex items-center justify-center mb-4 shadow-lg">
            <img
              src="/assets/generated/school-logo.dim_256x256.png"
              alt="School Logo"
              className="w-20 h-20 object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-school-navy tracking-tight">EduManage</h1>
          <p className="text-school-navy/60 text-sm mt-1 font-medium">School Management System</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-school-navy text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs value={tab} onValueChange={(v) => { setTab(v as 'teacher' | 'student'); setError(''); }}>
              <TabsList className="grid grid-cols-2 w-full mb-6 bg-school-navy/5">
                <TabsTrigger value="teacher" className="data-[state=active]:bg-school-navy data-[state=active]:text-white gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="student" className="data-[state=active]:bg-school-gold data-[state=active]:text-school-navy gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
              </TabsList>

              {/* Teacher Login */}
              <TabsContent value="teacher" className="space-y-4">
                <div className="bg-school-navy/5 rounded-lg p-4 text-sm text-school-navy/70 border border-school-navy/10">
                  <p className="font-medium text-school-navy mb-1">Teacher Access</p>
                  <p>Click the button below to authenticate with your Internet Identity. Only authorized teachers can access the admin dashboard.</p>
                </div>

                {error && tab === 'teacher' && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {identity && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                    ✓ Identity connected. Click below to verify teacher access.
                  </div>
                )}

                <Button
                  className="w-full bg-school-navy hover:bg-school-navy/90 text-white h-11 font-semibold"
                  onClick={handleTeacherLogin}
                  disabled={isLoggingIn || isInitializing || teacherStep === 'checking' || actorFetching}
                >
                  {(isLoggingIn || teacherStep === 'checking' || actorFetching) ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {actorFetching ? 'Connecting...' : 'Verifying...'}</>
                  ) : identity ? (
                    'Enter Teacher Dashboard'
                  ) : (
                    'Sign In as Teacher'
                  )}
                </Button>
              </TabsContent>

              {/* Student Login */}
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="s-username" className="text-school-navy font-medium">Username</Label>
                    <Input
                      id="s-username"
                      placeholder="Enter your username"
                      value={studentUsername}
                      onChange={(e) => setStudentUsername(e.target.value)}
                      className="border-school-navy/20 focus:border-school-gold h-11"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-password" className="text-school-navy font-medium">Password</Label>
                    <Input
                      id="s-password"
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="border-school-navy/20 focus:border-school-gold h-11"
                      autoComplete="current-password"
                    />
                  </div>

                  {error && tab === 'student' && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {!identity && (
                    <p className="text-xs text-school-navy/50 text-center">
                      You'll be asked to authenticate with Internet Identity first.
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-school-gold hover:bg-school-gold/90 text-school-navy h-11 font-semibold"
                    disabled={studentLoginMutation.isPending || isLoggingIn || actorFetching}
                  >
                    {(studentLoginMutation.isPending || isLoggingIn || actorFetching) ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                    ) : (
                      'Sign In as Student'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-school-navy/40 text-xs mt-6">
          © {new Date().getFullYear()} EduManage · Built with{' '}
          <span className="text-school-gold">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'school-management-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-school-navy/60"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
