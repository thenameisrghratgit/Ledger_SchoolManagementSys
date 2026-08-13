import { useMemo, useState } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import SelectInput from '../../components/ui/SelectInput.jsx'
import Button from '../../components/ui/Button.jsx'
import StudentModal from '../../components/admin/StudentModal.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import { CLASS_OPTIONS, SEED_STUDENTS } from '../../data/students.js'

const PAGE_SIZE = 6

export default function Students() {
  const [students, setStudents] = useState(SEED_STUDENTS)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)

  const [modal, setModal] = useState(null) // { mode: 'add'|'view'|'edit', student }
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      const matchesQuery = !q || s.studentId.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      const matchesClass = !classFilter || s.className === classFilter
      return matchesQuery && matchesClass
    })
  }, [students, search, classFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const resetToFirstPage = () => setPage(1)

  const handleSave = (form) => {
    const exists = students.some((s) => s.studentId.toLowerCase() === form.studentId.trim().toLowerCase())

    if (modal?.mode === 'add' && exists) {
      return { ok: false, field: 'studentId', error: 'A student with this ID already exists.' }
    }

    const normalized = { ...form, studentId: form.studentId.trim() }
    setStudents((prev) => {
      if (modal?.mode === 'edit') {
        return prev.map((s) => (s.studentId === modal.student.studentId ? normalized : s))
      }
      return [normalized, ...prev]
    })
    setPage(1)
    setModal(null)
    return { ok: true }
  }

  const handleDeleteConfirm = () => {
    setStudents((prev) => prev.filter((s) => s.studentId !== deleteTarget.studentId))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-text">Student Management</h2>
          <p className="mt-1 text-[14.5px] text-text-secondary">Manage student records and enrollment details</p>
        </div>
        <Button
          variant="primary"
          className="w-auto shrink-0 px-5"
          onClick={() => setModal({ mode: 'add', student: null })}
        >
          <Plus size={17} /> Add Student
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface-card p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetToFirstPage() }}
              placeholder="Search by Student ID or Name"
              className="focus-ring w-full rounded-lg border border-border bg-surface-card py-2.5 pl-11 pr-3.5 text-[14.5px] text-text placeholder:text-text-secondary transition-colors duration-150 hover:border-[#C6D0DB] focus:border-navy focus:ring-navy/10"
            />
          </div>
          <SelectInput
            className="sm:w-56"
            placeholder="All classes"
            options={CLASS_OPTIONS}
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); resetToFirstPage() }}
          />
          {(search || classFilter) && (
            <button
              onClick={() => { setSearch(''); setClassFilter(''); resetToFirstPage() }}
              className="focus-ring shrink-0 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-navy hover:underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {['Student ID', 'Name', 'Class', 'Parent Name', 'Contact', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-[12.5px] font-semibold uppercase tracking-wide text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-[14px] text-text-secondary">
                    No students match your search.
                  </td>
                </tr>
              )}
              {pageRows.map((s) => (
                <tr key={s.studentId} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-3 py-3.5 text-[13.5px] font-medium text-text">{s.studentId}</td>
                  <td className="px-3 py-3.5 text-[14px] text-text">{s.name}</td>
                  <td className="px-3 py-3.5 text-[14px] text-text-secondary">
                    {s.className}{s.section ? ` - ${s.section}` : ''}
                  </td>
                  <td className="px-3 py-3.5 text-[14px] text-text-secondary">{s.parentName}</td>
                  <td className="px-3 py-3.5 text-[14px] text-text-secondary">{s.contact}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <ActionButton label="View" onClick={() => setModal({ mode: 'view', student: s })}>
                        <Eye size={15} />
                      </ActionButton>
                      <ActionButton label="Edit" onClick={() => setModal({ mode: 'edit', student: s })}>
                        <Pencil size={15} />
                      </ActionButton>
                      <ActionButton label="Delete" tone="rose" onClick={() => setDeleteTarget(s)}>
                        <Trash2 size={15} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
          <p className="text-[13px] text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1}
            {'\u2013'}{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} students
          </p>
          <div className="flex items-center gap-2">
            <PageButton disabled={pageSafe === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} />
            </PageButton>
            <span className="px-2 text-[13.5px] font-medium text-text">
              Page {pageSafe} of {totalPages}
            </span>
            <PageButton disabled={pageSafe === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight size={16} />
            </PageButton>
          </div>
        </div>
      </div>

      {modal && (
        <StudentModal
          mode={modal.mode}
          student={modal.student}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onEdit={() => setModal({ mode: 'edit', student: modal.student })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this student?"
          description={`This will permanently remove ${deleteTarget.name} (${deleteTarget.studentId}) from the student records. This action cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

function ActionButton({ label, tone = 'navy', onClick, children }) {
  const tones = {
    navy: 'text-text-secondary hover:bg-navy/[0.08] hover:text-navy',
    rose: 'text-text-secondary hover:bg-rose-50 hover:text-rose-500',
  }
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`focus-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

function PageButton({ disabled, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors duration-150 hover:border-[#C6D0DB] hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
