"use client";

type Variant = "ocr" | "analyze" | "transcribe" | "video";

type Props = { variant: Variant };

export default function IconBox({ variant }: Props) {
  const isOrange = variant === "transcribe" || variant === "video";
  const boxClass = `icon-box ${isOrange ? "icon-box--orange text-orange-400" : "icon-box--blue text-blue-400"}`;

  return (
    <div className={boxClass} aria-hidden>
      {variant === "ocr" && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 8h10M7 12h10M7 16h6" />
        </svg>
      )}
      {variant === "analyze" && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="10" height="10" rx="1" />
          <rect x="10" y="10" width="10" height="10" rx="1" />
        </svg>
      )}
      {variant === "transcribe" && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <rect x="7" y="9" width="10" height="6" rx="1" />
        </svg>
      )}
      {variant === "video" && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="16" height="12" rx="2" />
          <path d="M22 8l-6 4 6 4V8z" />
        </svg>
      )}
    </div>
  );
}
