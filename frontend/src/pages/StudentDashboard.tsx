import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import DashboardLayout from '../components/layout/DashboardLayout';
import MyAttendanceSection from '../components/student/MyAttendanceSection';
import MyMarksSection from '../components/student/MyMarksSection';
import StudentEventsSection from '../components/student/StudentEventsSection';
import MySemesterResultsSection from '../components/student/MySemesterResultsSection';
import ComplaintBoxSection from '../components/student/ComplaintBoxSection';
import { ClipboardList, BookOpen, Calendar, Award, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'attendance', label: 'My Attendance', icon: ClipboardList },
  { id: 'marks', label: 'My Marks', icon: BookOpen },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'semesters', label: 'My Results', icon: Award },
  { id: 'complaint', label: 'Complaint Box', icon: MessageSquare },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const role = useAuth((s) => s.role);
  const studentName = useAuth((s) => s.studentName);
  const logout = useAuth((s) => s.logout);
  const { clear } = useInternetIdentity();
  const [activeSection, setActiveSection] = useState('attendance');

  useEffect(() => {
    if (role !== 'student') {
      navigate({ to: '/' });
    }
  }, [role, navigate]);

  const handleLogout = async () => {
    logout();
    await clear();
    navigate({ to: '/' });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'attendance': return <MyAttendanceSection />;
      case 'marks': return <MyMarksSection />;
      case 'events': return <StudentEventsSection />;
      case 'semesters': return <MySemesterResultsSection />;
      case 'complaint': return <ComplaintBoxSection />;
      default: return <MyAttendanceSection />;
    }
  };

  if (role !== 'student') return null;

  return (
    <DashboardLayout
      role="student"
      navItems={NAV_ITEMS}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
      userName={studentName || 'Student'}
    >
      {renderSection()}
    </DashboardLayout>
  );
}
