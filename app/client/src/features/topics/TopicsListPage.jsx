import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui';
import { LucideIcon } from '@icons';
import topicsApi from './api.js';

const STATUS_ALL_VALUE = 'ALL';

const STATUS_OPTIONS = [
  { value: STATUS_ALL_VALUE, label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In review' },
  { value: 'CHANGES_REQUESTED', label: 'Changes requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
];

const STATUS_COLORS = {
  DRAFT: 'bg-neutral-200 text-neutral-800',
  IN_REVIEW: 'bg-support-sky text-support-forest',
  CHANGES_REQUESTED: 'bg-destructive/10 text-destructive',
  APPROVED: 'bg-secondary text-secondary-foreground',
  PUBLISHED: 'bg-ecru text-black-olive',
  ARCHIVED: 'bg-neutral-200 text-neutral-600',
};

function StatusBadge({ status }) {
  if (!status) {
    return null;
  }

  const tone = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  return <Badge className={tone}>{label}</Badge>;
}

function TopicTable({ items, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
        Fetching topics…
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
        No topics match the current filters.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[28rem]">Topic</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Language</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((topic) => (
          <TableRow key={topic.id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Link to={`/topics/${topic.id}`} className="font-semibold text-brand-700 hover:underline">
                  {topic.title}
                </Link>
                <p className="text-sm text-neutral-600">{topic.summary || 'No summary provided yet.'}</p>
                {topic.tags && topic.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {topic.tags.map((tag) => (
                      <Badge key={`${topic.id}-${tag.slug || tag.id}`} variant="secondary">
                        {tag.label || tag.slug}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={topic.status} />
            </TableCell>
            <TableCell className="uppercase">{topic.language}</TableCell>
            <TableCell>
              {topic.updatedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(topic.updatedAt)) : '—'}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/topics/${topic.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function TopicsListPage() {
  const [filters, setFilters] = useState({ status: STATUS_ALL_VALUE, search: '' });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [state, setState] = useState({ loading: true, items: [], total: 0 });

  const loadTopics = useCallback(
    async (nextFilters = filters, nextPagination = pagination) => {
      setState((current) => ({ ...current, loading: true }));
      try {
        const result = await topicsApi.listTopics({
          status: !nextFilters.status || nextFilters.status === STATUS_ALL_VALUE ? undefined : nextFilters.status,
          search: nextFilters.search || undefined,
          page: nextPagination.page,
          pageSize: nextPagination.pageSize,
        });
        setState({
          loading: false,
          items: result.items || [],
          total: result.total || 0,
        });
        setPagination({ page: result.page || nextPagination.page, pageSize: result.pageSize || nextPagination.pageSize });
      } catch (error) {
        setState({ loading: false, items: [], total: 0 });
        console.error('Failed to load topics', error);
      }
    },
    [filters, pagination],
  );

  useEffect(() => {
    loadTopics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = useCallback(
    (value) => {
      const nextFilters = { ...filters, status: value };
      setFilters(nextFilters);
      loadTopics(nextFilters, { page: 1, pageSize: pagination.pageSize });
    },
    [filters, pagination.pageSize, loadTopics],
  );

  const handleSearch = useCallback(
    (event) => {
      const value = event.target.value;
      setFilters((current) => ({ ...current, search: value }));
    },
    [],
  );

  const debouncedSearchTerm = useDebouncedValue(filters.search, 300);

  useEffect(() => {
    loadTopics({ ...filters, search: debouncedSearchTerm }, { page: 1, pageSize: pagination.pageSize });
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const paginator = useMemo(() => {
    const pages = Math.max(1, Math.ceil((state.total || 0) / pagination.pageSize));
    return { pages, hasNext: pagination.page < pages, hasPrevious: pagination.page > 1 };
  }, [pagination.page, pagination.pageSize, state.total]);

  const goToPage = useCallback(
    (page) => {
      const clamped = Math.max(1, page);
      setPagination((current) => ({ ...current, page: clamped }));
      loadTopics(filters, { page: clamped, pageSize: pagination.pageSize });
    },
    [filters, pagination.pageSize, loadTopics],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Topic Management</h1>
        <p className="text-sm text-neutral-600">
          Draft, review, and publish topics using the collaborative workflow.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Topic library</CardTitle>
            <CardDescription>Filter by workflow status and search across drafts.</CardDescription>
          </div>
          <Button asChild>
            <Link to="/topics/new">
              <LucideIcon name="Plus" className="mr-2 h-4 w-4" /> New topic
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <LucideIcon name="Filter" className="h-4 w-4 text-neutral-500" />
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <LucideIcon name="Search" className="h-4 w-4 text-neutral-500" />
              <Input
                value={filters.search}
                onChange={handleSearch}
                placeholder="Search by title or summary"
                className="max-w-sm"
              />
            </div>
            <Button variant="ghost" onClick={() => loadTopics(filters, pagination)}>
              <LucideIcon name="RefreshCw" className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
          <TopicTable items={state.items} isLoading={state.loading} />
          <div className="flex items-center justify-between pt-2 text-sm text-neutral-600">
            <div>
              Showing {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, state.total)} of {state.total} topics
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!paginator.hasPrevious}
                onClick={() => goToPage(pagination.page - 1)}
              >
                Previous
              </Button>
              <span>
                Page {pagination.page} of {paginator.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!paginator.hasNext}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
