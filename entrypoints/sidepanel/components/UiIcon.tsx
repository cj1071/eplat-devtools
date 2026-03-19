type IconName =
  | 'app'
  | 'snippets'
  | 'clipboard'
  | 'settings'
  | 'status'
  | 'history'
  | 'link'
  | 'switch'
  | 'keyboard'
  | 'template'
  | 'info';

interface UiIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

function IconPaths({ name }: { name: IconName }) {
  switch (name) {
    case 'app':
      return (
        <>
          <path d="M5 7.5 12 4l7 3.5v9L12 20l-7-3.5z" />
          <path d="M12 4v16" />
          <path d="M5 7.5 12 11l7-3.5" />
        </>
      );
    case 'snippets':
      return (
        <>
          <path d="M8 8 4 12l4 4" />
          <path d="m16 8 4 4-4 4" />
          <path d="m13.5 5-3 14" />
        </>
      );
    case 'clipboard':
      return (
        <>
          <rect x="7" y="4" width="10" height="16" rx="2" />
          <path d="M9 4.5h6" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
        </>
      );
    case 'settings':
      return (
        <>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M4.9 4.9 7 7" />
          <path d="m17 17 2.1 2.1" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="M4.9 19.1 7 17" />
          <path d="M17 7l2.1-2.1" />
          <circle cx="12" cy="12" r="3.5" />
        </>
      );
    case 'status':
      return (
        <>
          <path d="M5 12h14" />
          <path d="M5 8h9" />
          <path d="M5 16h7" />
          <circle cx="17" cy="8" r="1.5" />
          <circle cx="14" cy="16" r="1.5" />
        </>
      );
    case 'history':
      return (
        <>
          <path d="M4 12a8 8 0 1 0 2.4-5.7" />
          <path d="M4 4v4h4" />
          <path d="M12 8v4l2.5 1.5" />
        </>
      );
    case 'link':
      return (
        <>
          <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 1 1 7 7L17 13" />
          <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 1 1-7-7L7 11" />
        </>
      );
    case 'switch':
      return (
        <>
          <rect x="3" y="7" width="18" height="10" rx="5" />
          <circle cx="16" cy="12" r="3" />
        </>
      );
    case 'keyboard':
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 10h.01" />
          <path d="M11 10h.01" />
          <path d="M15 10h.01" />
          <path d="M7 14h10" />
        </>
      );
    case 'template':
      return (
        <>
          <path d="M6 4h9l3 3v13H6z" />
          <path d="M15 4v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </>
      );
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6" />
          <path d="M12 7h.01" />
        </>
      );
    default:
      return null;
  }
}

export default function UiIcon({ name, size = 16, className }: UiIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <IconPaths name={name} />
    </svg>
  );
}
