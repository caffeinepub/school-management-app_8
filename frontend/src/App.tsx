import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const teacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/dashboard',
  component: TeacherDashboard,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/dashboard',
  component: StudentDashboard,
});

const routeTree = rootRoute.addChildren([loginRoute, teacherRoute, studentRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
