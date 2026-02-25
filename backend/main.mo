import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type AttendanceStatus = { #present; #absent };
  public type Semester = { id : Nat; name : Text; startDate : Int; endDate : Int };

  public type Teacher = {
    id : Principal;
    username : Text;
    password : Text;
  };

  public type Student = {
    id : Principal;
    name : Text;
    username : Text;
    password : Text;
  };

  public type Attendance = {
    studentId : Principal;
    date : Int;
    status : AttendanceStatus;
  };

  public type Mark = {
    studentId : Principal;
    subject : Text;
    score : Nat;
    maxScore : Nat;
    semester : Nat;
  };

  public type Event = {
    id : Nat;
    title : Text;
    description : Text;
    date : Int;
  };

  public type SemesterExamResult = {
    studentId : Principal;
    semesterId : Nat;
    subject : Text;
    score : Nat;
    maxScore : Nat;
  };

  public type Complaint = {
    id : Nat;
    studentId : Principal;
    message : Text;
    timestamp : Int;
  };

  // UserProfile type required by the frontend
  public type UserProfile = {
    name : Text;
    role : Text;
  };

  // Persistent Storage
  let students = Map.empty<Principal, Student>();
  let attendances = List.empty<Attendance>();
  let marks = List.empty<Mark>();
  let semesters = List.empty<Semester>();
  let events = List.empty<Event>();
  let semesterExamResults = List.empty<SemesterExamResult>();
  let complaints = List.empty<Complaint>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let nextEventId = List.empty<Nat>();
  let nextComplaintId = List.empty<Nat>();

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // UserProfile functions required by the frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Pending student registrations (username -> pending data)
  public type PendingStudent = {
    name : Text;
    username : Text;
    password : Text;
  };
  let pendingStudents = Map.empty<Text, PendingStudent>();

  // Student Management
  public shared ({ caller }) func createStudent(name : Text, username : Text, password : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can create students");
    };

    // Check if username already taken
    let existing = students.values().filter(
      func(s) { Text.equal(s.username, username) }
    );

    switch (existing.next()) {
      case (?_) { Runtime.trap("Username already exists") };
      case (null) {};
    };

    // We use a derived principal based on username for the student id
    // Since we cannot generate new principals, we use the caller's principal
    // combined with a unique identifier. For this system, the student principal
    // is managed externally; here we store by username lookup.
    // The student will log in and their caller principal will be their id.
    // For creation, we store a placeholder that gets updated on first login.
    // NOTE: In this architecture, student principals are their own IC principals.
    // The teacher creates the account; the student logs in with their own principal.
    // We store a pending registration keyed by username.
    pendingStudents.add(username, { name; username; password });
  };

  // Student login: associates the caller's principal with their student account
  public shared ({ caller }) func studentLogin(username : Text, password : Text) : async Bool {
    // Check if already registered as a full student
    let existingStudent = students.values().filter(
      func(s) { Text.equal(s.username, username) }
    );
    switch (existingStudent.next()) {
      case (?student) {
        if (password != student.password) {
          return false;
        };
        // Assign user role to this principal
        AccessControl.assignRole(accessControlState, caller, caller, #user);
        return true;
      };
      case (null) {};
    };

    // Check pending students
    switch (pendingStudents.get(username)) {
      case (?pending) {
        if (password != pending.password) {
          return false;
        };
        // Promote pending to full student
        students.add(
          caller,
          {
            id = caller;
            name = pending.name;
            username = pending.username;
            password = pending.password;
          },
        );
        pendingStudents.remove(username);
        // Assign user role
        AccessControl.assignRole(accessControlState, caller, caller, #user);
        // Save profile
        userProfiles.add(caller, { name = pending.name; role = "student" });
        return true;
      };
      case (null) { return false };
    };
  };

  // Get all students (teacher only)
  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all students");
    };
    students.values().toArray();
  };

  // Attendance Functions
  public shared ({ caller }) func addAttendance(studentId : Principal, date : Int, status : AttendanceStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can add attendance");
    };

    attendances.add({
      studentId;
      date;
      status;
    });
  };

  public shared ({ caller }) func updateAttendance(studentId : Principal, date : Int, status : AttendanceStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can update attendance");
    };

    // Remove existing record for this student+date and add updated one
    let filtered = attendances.filter(
      func(a) { not (a.studentId == studentId and a.date == date) }
    );
    // Clear and re-add
    attendances.clear();
    let filteredArray = filtered.toArray();
    for (a in filteredArray.values()) {
      attendances.add(a);
    };
    attendances.add({ studentId; date; status });
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : Principal) : async [Attendance] {
    // Teacher can view any student's attendance; student can only view their own
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
        Runtime.trap("Unauthorized: Must be authenticated to view attendance");
      };
      if (caller != studentId) {
        Runtime.trap("Unauthorized: Students can only view their own attendance");
      };
    };

    let filtered = attendances.filter(
      func(a) { a.studentId == studentId }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getAttendanceAll() : async [Attendance] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all attendance records");
    };
    attendances.toArray();
  };

  // Marks Functions
  public shared ({ caller }) func addMark(studentId : Principal, subject : Text, score : Nat, maxScore : Nat, semester : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can add marks");
    };

    marks.add({
      studentId;
      subject;
      score;
      maxScore;
      semester;
    });
  };

  public shared ({ caller }) func updateMark(studentId : Principal, subject : Text, score : Nat, maxScore : Nat, semester : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can update marks");
    };

    let filtered = marks.filter(
      func(m) { not (m.studentId == studentId and Text.equal(m.subject, subject) and m.semester == semester) }
    );
    marks.clear();
    let filteredArray = filtered.toArray();
    for (m in filteredArray.values()) {
      marks.add(m);
    };
    marks.add({ studentId; subject; score; maxScore; semester });
  };

  public query ({ caller }) func getMarksByStudent(studentId : Principal) : async [Mark] {
    // Teacher can view any student's marks; student can only view their own
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
        Runtime.trap("Unauthorized: Must be authenticated to view marks");
      };
      if (caller != studentId) {
        Runtime.trap("Unauthorized: Students can only view their own marks");
      };
    };

    let filtered = marks.filter(
      func(m) { m.studentId == studentId }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getAllMarks() : async [Mark] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all marks");
    };
    marks.toArray();
  };

  // Event Functions
  public shared ({ caller }) func createEvent(title : Text, description : Text, date : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can create events");
    };

    let id = switch (nextEventId.last()) {
      case (null) { 1 };
      case (?lastId) { lastId + 1 };
    };

    events.add({
      id;
      title;
      description;
      date;
    });
    nextEventId.add(id);
  };

  public shared ({ caller }) func updateEvent(id : Nat, title : Text, description : Text, date : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can update events");
    };

    let filtered = events.filter(func(e) { e.id != id });
    events.clear();
    let filteredArray = filtered.toArray();
    for (e in filteredArray.values()) {
      events.add(e);
    };
    events.add({ id; title; description; date });
  };

  public shared ({ caller }) func deleteEvent(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can delete events");
    };

    let filtered = events.filter(func(e) { e.id != id });
    events.clear();
    let filteredArray = filtered.toArray();
    for (e in filteredArray.values()) {
      events.add(e);
    };
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    // Accessible by both teacher and authenticated students
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view events");
    };
    events.toArray();
  };

  // Semester Functions
  public shared ({ caller }) func addSemester(name : Text, startDate : Int, endDate : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can add semesters");
    };

    let id = switch (semesters.last()) {
      case (null) { 1 };
      case (?lastSemester) { lastSemester.id + 1 };
    };

    semesters.add({
      id;
      name;
      startDate;
      endDate;
    });
  };

  public query ({ caller }) func getSemesters() : async [Semester] {
    // Accessible by all authenticated users
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view semesters");
    };
    semesters.toArray();
  };

  public shared ({ caller }) func addSemesterExamResult(studentId : Principal, semesterId : Nat, subject : Text, score : Nat, maxScore : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can add semester exam results");
    };

    semesterExamResults.add({
      studentId;
      semesterId;
      subject;
      score;
      maxScore;
    });
  };

  public query ({ caller }) func getSemesterExamResultsByStudent(studentId : Principal) : async [SemesterExamResult] {
    // Teacher can view any student's results; student can only view their own
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
        Runtime.trap("Unauthorized: Must be authenticated to view semester exam results");
      };
      if (caller != studentId) {
        Runtime.trap("Unauthorized: Students can only view their own semester exam results");
      };
    };

    let filtered = semesterExamResults.filter(
      func(result) { result.studentId == studentId }
    );
    filtered.toArray();
  };

  // Complaint Functions
  public shared ({ caller }) func submitComplaint(message : Text) : async () {
    // Only authenticated students (users) can submit complaints
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated students can submit complaints");
    };
    // Admins (teachers) should not submit complaints
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Teachers cannot submit complaints");
    };

    let id = switch (nextComplaintId.last()) {
      case (null) { 1 };
      case (?lastId) { lastId + 1 };
    };

    complaints.add({
      id;
      studentId = caller;
      message;
      timestamp = Time.now();
    });
    nextComplaintId.add(id);
  };

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all complaints");
    };
    complaints.toArray();
  };
};
