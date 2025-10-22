import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>BudgetBolt Logo</title>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
      <path d="m10 12.6-3.1-1.6" />
      <path d="M14 12.6V17l-4 2" />
      <path d="M10 7.4 14 5" />
      <path d="m7.3 9-3.3 1.7" />
    </svg>
  );
}
