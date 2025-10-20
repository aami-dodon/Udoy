import { cn } from '@/lib/utils';

const FALLBACK_EMAIL = 'support@udoy.in';
const supportEmail = (import.meta.env?.VITE_SUPPORT_EMAIL || FALLBACK_EMAIL).trim();
const supportMailto = supportEmail ? `mailto:${supportEmail}` : '';

export function SupportContactMessage({ className }) {
  if (!supportEmail) {
    return null;
  }

  return (
    <p className={cn('text-xs text-neutral-500', className)}>
      Need help? Write to{' '}
      <a className="text-evergreen hover:underline" href={supportMailto}>
        {supportEmail}
      </a>
      .
    </p>
  );
}
