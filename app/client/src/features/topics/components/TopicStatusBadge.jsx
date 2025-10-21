import PropTypes from 'prop-types';
import { Badge } from '@components/ui';
import { cn } from '@/lib/utils.js';

const STATUS_LABELS = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

const STATUS_VARIANTS = {
  DRAFT: { variant: 'muted', className: 'text-neutral-700' },
  IN_REVIEW: { variant: 'secondary', className: 'bg-support-sky text-support-forest' },
  CHANGES_REQUESTED: { variant: 'outline', className: 'border-destructive/50 text-destructive' },
  APPROVED: { variant: 'secondary', className: 'bg-mint-sage text-black-olive' },
  PUBLISHED: { variant: 'default', className: '' },
  ARCHIVED: { variant: 'outline', className: 'border-muted text-muted-foreground' },
};

export default function TopicStatusBadge({ status, className }) {
  if (!status) {
    return null;
  }

  const normalized = status.toUpperCase();
  const label = STATUS_LABELS[normalized] || normalized;
  const { variant, className: statusClassName } = STATUS_VARIANTS[normalized] || STATUS_VARIANTS.DRAFT;

  return (
    <Badge variant={variant} className={cn('px-2 py-1 text-xs uppercase tracking-wide', statusClassName, className)}>
      {label}
    </Badge>
  );
}

TopicStatusBadge.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
};

TopicStatusBadge.defaultProps = {
  status: null,
  className: '',
};
