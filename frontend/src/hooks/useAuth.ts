import { create } from 'zustand';

export type AuthRole = 'teacher' | 'student' | null;

interface AuthState {
  role: AuthRole;
  studentId: string | null;
  studentName: string | null;
  setTeacher: () => void;
  setStudent: (id: string, name: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  role: null,
  studentId: null,
  studentName: null,
  setTeacher: () => set({ role: 'teacher', studentId: null, studentName: null }),
  setStudent: (id: string, name: string) => set({ role: 'student', studentId: id, studentName: name }),
  logout: () => set({ role: null, studentId: null, studentName: null }),
}));
