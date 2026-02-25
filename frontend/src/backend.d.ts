import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SemesterExamResult {
    studentId: Principal;
    maxScore: bigint;
    subject: string;
    semesterId: bigint;
    score: bigint;
}
export interface Attendance {
    status: AttendanceStatus;
    studentId: Principal;
    date: bigint;
}
export interface Complaint {
    id: bigint;
    studentId: Principal;
    message: string;
    timestamp: bigint;
}
export interface Event {
    id: bigint;
    title: string;
    date: bigint;
    description: string;
}
export interface Semester {
    id: bigint;
    endDate: bigint;
    name: string;
    startDate: bigint;
}
export interface Mark {
    studentId: Principal;
    semester: bigint;
    maxScore: bigint;
    subject: string;
    score: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Student {
    id: Principal;
    username: string;
    password: string;
    name: string;
}
export enum AttendanceStatus {
    present = "present",
    absent = "absent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAttendance(studentId: Principal, date: bigint, status: AttendanceStatus): Promise<void>;
    addMark(studentId: Principal, subject: string, score: bigint, maxScore: bigint, semester: bigint): Promise<void>;
    addSemester(name: string, startDate: bigint, endDate: bigint): Promise<void>;
    addSemesterExamResult(studentId: Principal, semesterId: bigint, subject: string, score: bigint, maxScore: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(title: string, description: string, date: bigint): Promise<void>;
    createStudent(name: string, username: string, password: string): Promise<void>;
    deleteEvent(id: bigint): Promise<void>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllMarks(): Promise<Array<Mark>>;
    getAllStudents(): Promise<Array<Student>>;
    getAttendanceAll(): Promise<Array<Attendance>>;
    getAttendanceByStudent(studentId: Principal): Promise<Array<Attendance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMarksByStudent(studentId: Principal): Promise<Array<Mark>>;
    getSemesterExamResultsByStudent(studentId: Principal): Promise<Array<SemesterExamResult>>;
    getSemesters(): Promise<Array<Semester>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    studentLogin(username: string, password: string): Promise<boolean>;
    submitComplaint(message: string): Promise<void>;
    updateAttendance(studentId: Principal, date: bigint, status: AttendanceStatus): Promise<void>;
    updateEvent(id: bigint, title: string, description: string, date: bigint): Promise<void>;
    updateMark(studentId: Principal, subject: string, score: bigint, maxScore: bigint, semester: bigint): Promise<void>;
}
