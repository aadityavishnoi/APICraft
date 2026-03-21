import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CopyButton = ({ text, style, className = "btn-icon" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={className} style={{ padding: '0.4rem', color: copied ? '#34d399' : 'var(--text-muted)', ...style }} title="Copy to clipboard">
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};
