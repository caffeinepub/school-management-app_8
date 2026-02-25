import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, GraduationCap, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  role: 'teacher' | 'student';
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
  children: ReactNode;
}

export default function DashboardLayout({
  role,
  navItems,
  activeSection,
  onSectionChange,
  onLogout,
  userName,
  children,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTeacher = role === 'teacher';

  const activeItem = navItems.find((n) => n.id === activeSection);

  return (
    <div className="min-h-screen flex bg-school-bg">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 flex flex-col
          bg-school-navy text-white shadow-2xl
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-school-gold/20 border-2 border-school-gold/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src="/assets/generated/school-logo.dim_256x256.png"
              alt="School Logo"
              className="w-9 h-9 object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                if (el.parentElement) {
                  el.parentElement.innerHTML = '<span style="font-size:1.125rem">🎓</span>';
                }
              }}
            />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">EduManage</p>
            <p className="text-white/50 text-xs">School System</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${isTeacher ? 'bg-school-gold/20 text-school-gold' : 'bg-blue-400/20 text-blue-300'}`}>
            {isTeacher ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
            {isTeacher ? 'Teacher Admin' : 'Student'}
            <span className="ml-auto text-white/40 font-normal truncate max-w-[80px]">{userName}</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 text-left
                    ${isActive
                      ? isTeacher
                        ? 'bg-school-gold text-school-navy shadow-sm'
                        : 'bg-blue-500 text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/10 gap-2 justify-start"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-school-navy/10 px-4 lg:px-8 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <button
            className="lg:hidden text-school-navy/60 hover:text-school-navy"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-school-navy text-lg leading-tight">
              {activeItem?.label || 'Dashboard'}
            </h2>
            <p className="text-school-navy/40 text-xs">
              {isTeacher ? 'Teacher Admin Panel' : 'Student Portal'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isTeacher ? 'bg-school-navy text-white' : 'bg-school-gold/20 text-school-navy'}`}>
              {isTeacher ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {userName}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-school-navy/10 px-8 py-3 text-center text-xs text-school-navy/30">
          © {new Date().getFullYear()} EduManage · Built with{' '}
          <span className="text-school-gold">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'school-management-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-school-navy/50"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
