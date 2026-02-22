// ==================================================
// SportVerse AI - Loading Spinner Component
// ==================================================

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: { icon: 16, text: 'text-xs' },
    md: { icon: 24, text: 'text-sm' },
    lg: { icon: 32, text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="animate-spin text-primary-500 mb-3" size={s.icon} />
      <p className={`text-gray-400 ${s.text}`}>{text}</p>
    </div>
  );
}
