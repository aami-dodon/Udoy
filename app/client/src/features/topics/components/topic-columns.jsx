import { Link } from 'react-router-dom';
import { Badge, Button } from '@components/ui';

const STATUS_COLORS = {
  DRAFT: 'bg-neutral-200 text-neutral-800',
  IN_REVIEW: 'bg-support-sky text-support-forest',
  CHANGES_REQUESTED: 'bg-destructive/10 text-destructive',
  APPROVED: 'bg-secondary text-secondary-foreground',
  PUBLISHED: 'bg-ecru text-black-olive',
  ARCHIVED: 'bg-neutral-200 text-neutral-600',
};

const formatStatusLabel = (status) =>
  status
    ? status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)\S/g, (char) => char.toUpperCase())
    : '';

function StatusBadge({ status }) {
  if (!status) {
    return null;
  }

  const tone = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  const label = formatStatusLabel(status);

  return <Badge className={tone}>{label}</Badge>;
}

function TopicCell({ topic }) {
  return (
    <div className="flex flex-col gap-1">
      <Link to={`/topics/${topic.id}`} className="font-semibold text-brand-700 hover:underline">
        {topic.title}
      </Link>
      <p className="text-sm text-muted-foreground">{topic.summary || 'No summary provided yet.'}</p>
      {topic.tags && topic.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {topic.tags.map((tag) => (
            <Badge key={`${topic.id}-${tag.slug || tag.id}`} variant="secondary">
              {tag.label || tag.slug}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const formatUpdatedAt = (value) => {
  if (!value) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch (error) {
    return '—';
  }
};

export function createTopicColumns({ showStatus = true } = {}) {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Topic',
      cell: ({ row }) => <TopicCell topic={row.original} />,
      enableHiding: false,
    },
  ];

  if (showStatus) {
    columns.push({
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      meta: { className: 'w-[140px]' },
    });
  }

  columns.push(
    {
      accessorKey: 'language',
      header: 'Language',
      cell: ({ row }) => (row.original.language ? row.original.language.toUpperCase() : '—'),
      meta: { className: 'w-[100px]' },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => formatUpdatedAt(row.original.updatedAt),
      meta: { className: 'w-[200px]' },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link to={`/topics/${row.original.id}`}>Open</Link>
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: 'w-[120px]' },
    },
  );

  return columns;
}

export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In review' },
  { value: 'CHANGES_REQUESTED', label: 'Changes requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function getStatusTone(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
}
