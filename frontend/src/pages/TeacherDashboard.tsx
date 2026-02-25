import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import DashboardLayout from '../components/layout/DashboardLayout';
import StudentsSection from '../components/teacher/StudentsSection';
import AttendanceSection from '../components/teacher/AttendanceSection';
import MarksSection from '../components/teacher/MarksSection';
import EventsSection from '../components/teacher/EventsSection';
import SemestersSection from '../components/teacher/SemestersSection';
import ComplaintsSection from '../components/teacher/ComplaintsSection';
import { Users, ClipboardList, BookOpen, Calendar, Award, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: ClipboardList },
  { id: 'marks', label: 'Marks', icon: BookOpen },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'semesters', label: 'Semesters & Exams', icon: Award },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const role = useAuth((s) => s.role);
  const logout = useAuth((s) => s.logout);
  const { clear } = useInternetIdentity();
  const [activeSection, setActiveSection] = useState('students');

  useEffect(() => {
    if (role !== 'teacher') {
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
      case 'students': return <StudentsSection />;
      case 'attendance': return <AttendanceSection />;
      case 'marks': return <MarksSection />;
      case 'events': return <EventsSection />;
      case 'semesters': return <SemestersSection />;
      case 'complaints': return <ComplaintsSection />;
      default: return <StudentsSection />;
    }
  };

  if (role !== 'teacher') return null;

  return (
    <DashboardLayout
      role="teacher"
      navItems={NAV_ITEMS}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
      userName="Teacher"
    >
      {renderSection()}
    </DashboardLayout>
  );
}
