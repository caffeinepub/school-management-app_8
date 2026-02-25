# Specification

## Summary
**Goal:** Build SchoolHub, a school management web app on ICP with separate Teacher and Student roles, covering attendance, marks, events, semesters, and a complaint box.

**Planned changes:**
- Backend (single Motoko actor): define stable data models for Teacher, Student, Attendance, Mark, Event, Semester, SemesterExamResult, and Complaint; implement simple username/password authentication with session tokens for both teacher and students; expose role-gated CRUD functions for all entities
- Pre-seed one teacher account (username: `teacher`, password: `teacher123`)
- Teacher functions: create student accounts, manage attendance, marks, events, semesters, semester exam results, and view all complaints
- Student functions: view own attendance, marks, events, semester results, and submit complaints
- Frontend login page with Teacher / Student tab toggle and error handling; redirect to role-specific dashboard on success
- Teacher Dashboard with sidebar navigation: Students, Attendance, Marks, Events, Semesters & Exams, Complaints — full data entry and CRUD forms throughout
- Student Dashboard with sidebar navigation: My Attendance, My Marks, Events, My Semester Results, Complaint Box — read-only views plus complaint submission form
- School-themed design: deep navy and white with gold accents, sans-serif typography, sidebar layout, card-based content sections
- School crest logo displayed on login page and dashboard header/sidebar

**User-visible outcome:** A teacher can log in and fully manage students, attendance, marks, events, semesters, and read complaints. Students can log in with teacher-created credentials to view their own records and submit complaints. All data is role-restricted.
