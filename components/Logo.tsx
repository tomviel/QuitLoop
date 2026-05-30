interface LogoProps {
  /** Pixel size of the icon square (default: 32) */
  size?: number;
  /** Show "QuitLoop" wordmark beside the icon (default: false) */
  showWordmark?: boolean;
  /** Extra class applied to the wrapping element */
  className?: string;
}

/**
 * QuitLoop logo — inline SVG so it renders crisply at any size with no
 * network request. The gradient definitions are inlined per-instance.
 */
export function Logo({ size = 32, showWordmark = false, className = '' }: LogoProps) {
  const uid = `logo-${size}`;

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QuitLoop logo"
      role="img"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${uid}-ring`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="40%"  stopColor="#CCCCCC" />
          <stop offset="100%" stopColor="#666666" />
        </linearGradient>
        <linearGradient id={`${uid}-tail`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#CCCCCC" />
          <stop offset="100%" stopColor="#444444" />
        </linearGradient>
        <linearGradient id={`${uid}-dot`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#888888" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="500" height="500" fill="#0A0A0A" rx="100" />

      {/* Ring (the "loop") */}
      <circle
        cx="232" cy="225" r="108"
        fill="none"
        stroke={`url(#${uid}-ring)`}
        strokeWidth="38"
      />

      {/* Handle / tail */}
      <line
        x1="308" y1="304" x2="406" y2="406"
        stroke={`url(#${uid}-tail)`}
        strokeWidth="38"
        strokeLinecap="round"
      />

      {/* Centre dot */}
      <circle cx="232" cy="225" r="22" fill={`url(#${uid}-dot)`} />

      {/* Highlight glint */}
      <circle cx="226" cy="219" r="7" fill="white" opacity="0.4" />
    </svg>
  );

  if (!showWordmark) return icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon}
      <span className="font-bold text-text-primary" style={{ fontSize: Math.max(14, size * 0.5) }}>
        QuitLoop
      </span>
    </div>
  );
}
