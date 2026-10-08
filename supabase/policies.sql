-- ============================================================================
-- Ledgerhall School Management — Row Level Security policies
-- Run AFTER schema.sql and seed.sql
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.parent_student enable row level security;
alter table public.attendance enable row level security;
alter table public.examinations enable row level security;
alter table public.exam_results enable row level security;
alter table public.fees enable row level security;
alter table public.timetable enable row level security;
alter table public.teacher_attendance enable row level security;
alter table public.school_settings enable row level security;

-- ----------------------------------------------------------------------------
-- profiles: own profile (role/status protected by enforce_profile_update
-- trigger); admin sees all
-- ----------------------------------------------------------------------------

create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.app_is_admin());

create policy "profiles_insert_admin" on public.profiles
  for insert to authenticated
  with check (public.app_is_admin());

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.app_is_admin())
  with check (id = auth.uid() or public.app_is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- students: admin full; student own record; parent linked children;
-- teachers read-only for class rosters; writes admin only
-- ----------------------------------------------------------------------------

create policy "students_select" on public.students
  for select to authenticated
  using (
    public.app_is_admin()
    or auth_id = auth.uid()
    or public.app_profile_role() = 'teacher'
    or public.app_is_parent_of(student_id)
  );

create policy "students_insert_admin" on public.students
  for insert to authenticated
  with check (public.app_is_admin());

create policy "students_update" on public.students
  for update to authenticated
  using (public.app_is_admin() or auth_id = auth.uid())
  with check (public.app_is_admin() or auth_id = auth.uid());

create policy "students_delete_admin" on public.students
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- teachers: admin full; teacher own record
-- ----------------------------------------------------------------------------

create policy "teachers_select" on public.teachers
  for select to authenticated
  using (public.app_is_admin() or auth_id = auth.uid());

create policy "teachers_insert_admin" on public.teachers
  for insert to authenticated
  with check (public.app_is_admin());

create policy "teachers_update" on public.teachers
  for update to authenticated
  using (public.app_is_admin() or auth_id = auth.uid())
  with check (public.app_is_admin() or auth_id = auth.uid());

create policy "teachers_delete_admin" on public.teachers
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- parent_student: parents see their own links; admin manages all
-- (parent signup link is created by the security-definer auth trigger)
-- ----------------------------------------------------------------------------

create policy "parent_student_select" on public.parent_student
  for select to authenticated
  using (
    public.app_is_admin()
    or parent_id = auth.uid()
    or public.app_is_self_student(student_id)
  );

create policy "parent_student_insert_admin" on public.parent_student
  for insert to authenticated
  with check (public.app_is_admin());

create policy "parent_student_delete_admin" on public.parent_student
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- attendance: admin + teacher write; student/parent read own; teachers read all
-- ----------------------------------------------------------------------------

create policy "attendance_select" on public.attendance
  for select to authenticated
  using (
    public.app_is_admin()
    or public.app_profile_role() = 'teacher'
    or public.app_is_self_student(student_id)
    or public.app_is_parent_of(student_id)
  );

create policy "attendance_insert" on public.attendance
  for insert to authenticated
  with check (
    public.app_is_admin()
    or (public.app_profile_role() = 'teacher' and marked_by = auth.uid())
  );

create policy "attendance_update" on public.attendance
  for update to authenticated
  using (public.app_is_admin() or public.app_profile_role() = 'teacher')
  with check (public.app_is_admin() or public.app_profile_role() = 'teacher');

create policy "attendance_delete_admin" on public.attendance
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- examinations: everyone authenticated reads; admin writes
-- ----------------------------------------------------------------------------

create policy "examinations_select" on public.examinations
  for select to authenticated
  using (true);

create policy "examinations_insert_admin" on public.examinations
  for insert to authenticated
  with check (public.app_is_admin());

create policy "examinations_update_admin" on public.examinations
  for update to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

create policy "examinations_delete_admin" on public.examinations
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- exam_results: admin/teacher write; student reads own; parent reads linked
-- ----------------------------------------------------------------------------

create policy "exam_results_select" on public.exam_results
  for select to authenticated
  using (
    public.app_is_admin()
    or public.app_profile_role() = 'teacher'
    or public.app_is_self_student(student_id)
    or public.app_is_parent_of(student_id)
  );

create policy "exam_results_insert" on public.exam_results
  for insert to authenticated
  with check (public.app_is_admin() or public.app_profile_role() = 'teacher');

create policy "exam_results_update" on public.exam_results
  for update to authenticated
  using (public.app_is_admin() or public.app_profile_role() = 'teacher')
  with check (public.app_is_admin() or public.app_profile_role() = 'teacher');

create policy "exam_results_delete_admin" on public.exam_results
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- fees: student/parent read linked; admin full; parent may confirm payment
-- (status -> Paid only, enforced by enforce_fees_update trigger)
-- ----------------------------------------------------------------------------

create policy "fees_select" on public.fees
  for select to authenticated
  using (
    public.app_is_admin()
    or public.app_is_self_student(student_id)
    or public.app_is_parent_of(student_id)
  );

create policy "fees_insert_admin" on public.fees
  for insert to authenticated
  with check (public.app_is_admin());

create policy "fees_update" on public.fees
  for update to authenticated
  using (
    public.app_is_admin()
    or public.app_is_self_student(student_id)
    or public.app_is_parent_of(student_id)
  )
  with check (
    public.app_is_admin()
    or public.app_is_self_student(student_id)
    or public.app_is_parent_of(student_id)
  );

create policy "fees_delete_admin" on public.fees
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- teacher_attendance: teacher marks own daily status; admin reads all
-- ----------------------------------------------------------------------------

create policy "teacher_attendance_select" on public.teacher_attendance
  for select to authenticated
  using (
    public.app_is_admin()
    or public.app_is_self_teacher(teacher_id)
  );

create policy "teacher_attendance_insert" on public.teacher_attendance
  for insert to authenticated
  with check (
    public.app_is_admin()
    or (public.app_profile_role() = 'teacher' and public.app_is_self_teacher(teacher_id))
  );

create policy "teacher_attendance_update" on public.teacher_attendance
  for update to authenticated
  using (
    public.app_is_admin()
    or (public.app_profile_role() = 'teacher' and public.app_is_self_teacher(teacher_id))
  )
  with check (
    public.app_is_admin()
    or (public.app_profile_role() = 'teacher' and public.app_is_self_teacher(teacher_id))
  );

create policy "teacher_attendance_delete_admin" on public.teacher_attendance
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- timetable: everyone authenticated reads; admin writes
-- ----------------------------------------------------------------------------

create policy "timetable_select" on public.timetable
  for select to authenticated
  using (true);

create policy "timetable_insert_admin" on public.timetable
  for insert to authenticated
  with check (public.app_is_admin());

create policy "timetable_update_admin" on public.timetable
  for update to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

create policy "timetable_delete_admin" on public.timetable
  for delete to authenticated
  using (public.app_is_admin());

-- ----------------------------------------------------------------------------
-- school_settings: everyone authenticated reads; admin writes
-- ----------------------------------------------------------------------------

create policy "school_settings_select" on public.school_settings
  for select to authenticated
  using (true);

create policy "school_settings_update_admin" on public.school_settings
  for update to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

create policy "school_settings_insert_admin" on public.school_settings
  for insert to authenticated
  with check (public.app_is_admin());
