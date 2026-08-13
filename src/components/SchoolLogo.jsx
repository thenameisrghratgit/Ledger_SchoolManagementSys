/** Simple static education mark — open book with mortarboard line. */
export default function SchoolLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="8" fill="#172A46" />
      <path
        d="M12 14h8v14H12a2 2 0 01-2-2V16a2 2 0 012-2z M20 14h8a2 2 0 012 2v10a2 2 0 01-2 2h-8V14z"
        fill="#C6A15B"
        opacity="0.9"
      />
      <path
        d="M14 12l6-3 6 3"
        stroke="#C6A15B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
