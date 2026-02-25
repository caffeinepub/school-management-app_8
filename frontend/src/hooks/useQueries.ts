import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  type Student,
  type Attendance,
  type Mark,
  type Event,
  type Semester,
  type SemesterExamResult,
  type Complaint,
  AttendanceStatus,
} from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ─── Students ────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, username, password }: { name: string; username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStudent(name, username, password);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useGetAttendanceAll() {
  const { actor, isFetching } = useActor();
  return useQuery<Attendance[]>({
    queryKey: ['attendance', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendanceAll();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAttendanceByStudent(studentId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Attendance[]>({
    queryKey: ['attendance', studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getAttendanceByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useAddAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      date,
      status,
    }: {
      studentId: Principal;
      date: bigint;
      status: AttendanceStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAttendance(studentId, date, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useUpdateAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      date,
      status,
    }: {
      studentId: Principal;
      date: bigint;
      status: AttendanceStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAttendance(studentId, date, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

// ─── Marks ────────────────────────────────────────────────────────────────────

export function useGetAllMarks() {
  const { actor, isFetching } = useActor();
  return useQuery<Mark[]>({
    queryKey: ['marks', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMarks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMarksByStudent(studentId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Mark[]>({
    queryKey: ['marks', studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getMarksByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useAddMark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      subject,
      score,
      maxScore,
      semester,
    }: {
      studentId: Principal;
      subject: string;
      score: bigint;
      maxScore: bigint;
      semester: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMark(studentId, subject, score, maxScore, semester);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks'] }),
  });
}

export function useUpdateMark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      subject,
      score,
      maxScore,
      semester,
    }: {
      studentId: Principal;
      subject: string;
      score: bigint;
      maxScore: bigint;
      semester: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMark(studentId, subject, score, maxScore, semester);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks'] }),
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, date }: { title: string; description: string; date: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(title, description, date);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      date,
    }: {
      id: bigint;
      title: string;
      description: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateEvent(id, title, description, date);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteEvent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

// ─── Semesters ────────────────────────────────────────────────────────────────

export function useGetSemesters() {
  const { actor, isFetching } = useActor();
  return useQuery<Semester[]>({
    queryKey: ['semesters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSemesters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSemester() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, startDate, endDate }: { name: string; startDate: bigint; endDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSemester(name, startDate, endDate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['semesters'] }),
  });
}

export function useAddSemesterExamResult() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      semesterId,
      subject,
      score,
      maxScore,
    }: {
      studentId: Principal;
      semesterId: bigint;
      subject: string;
      score: bigint;
      maxScore: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSemesterExamResult(studentId, semesterId, subject, score, maxScore);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['semesterResults'] }),
  });
}

export function useGetSemesterExamResultsByStudent(studentId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SemesterExamResult[]>({
    queryKey: ['semesterResults', studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getSemesterExamResultsByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export function useGetAllComplaints() {
  const { actor, isFetching } = useActor();
  return useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitComplaint() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitComplaint(message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints'] }),
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useStudentLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.studentLogin(username, password);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
