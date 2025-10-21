import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui';
import DataTable from '@components/data-table.jsx';
import { LucideIcon } from '@icons';
import { useAuth } from '../auth/AuthProvider.jsx';
import { STATUS_FILTER_OPTIONS, createTopicColumns } from './components/topic-columns.jsx';
import topicsApi from './api.js';

const STATUS_ALL_VALUE = 'ALL';

const MANAGEMENT_ROLES = new Set(['admin', 'creator', 'teacher']);

export default function TopicsListPage() {
  const { user } = useAuth();
  const roles = useMemo(() => user?.roles || [], [user]);
  const isManager = useMemo(() => roles.some((role) => MANAGEMENT_ROLES.has(role)), [roles]);
  const canCreate = roles.includes('creator') || roles.includes('admin');

  const initialStatus = isManager ? STATUS_ALL_VALUE : 'PUBLISHED';
  const [filters, setFilters] = useState(() => ({ status: initialStatus, search: '' }));
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [state, setState] = useState({ loading: true, items: [], total: 0 });

  const loadTopics = useCallback(
    async (nextFilters, nextPagination) => {
      setState((current) => ({ ...current, loading: true }));
      try {
        const requestedStatus = isManager ? nextFilters.status : 'PUBLISHED';
        const normalizedStatus =
          !requestedStatus || requestedStatus === STATUS_ALL_VALUE ? undefined : requestedStatus;

        const result = await topicsApi.listTopics({
          status: normalizedStatus,
          search: nextFilters.search || undefined,
          page: nextPagination.page,
          pageSize: nextPagination.pageSize,
        });
        setState({
          loading: false,
          items: result.items || [],
          total: result.total || 0,
        });
        setPagination((current) => {
          const nextPage = result.page || nextPagination.page;
          const nextPageSize = result.pageSize || nextPagination.pageSize;
          if (current.page === nextPage && current.pageSize === nextPageSize) {
            return current;
          }
          return { page: nextPage, pageSize: nextPageSize };
        });
      } catch (error) {
        setState({ loading: false, items: [], total: 0 });
        console.error('Failed to load topics', error);
      }
    },
    [isManager],
  );

  useEffect(() => {
    const desiredStatus = isManager ? STATUS_ALL_VALUE : 'PUBLISHED';
    setFilters((current) => {
      if (current.status === desiredStatus) {
        return current;
      }
      return { ...current, status: desiredStatus };
    });
  }, [isManager]);

  const handleStatusChange = useCallback(
    (value) => {
      const targetValue = isManager ? value : 'PUBLISHED';
      setFilters((current) => ({ ...current, status: targetValue }));
      setPagination((current) => ({ ...current, page: 1 }));
    },
    [isManager],
  );

  const handleSearch = useCallback(
    (event) => {
      const value = event.target.value;
      setFilters((current) => ({ ...current, search: value }));
      setPagination((current) => ({ ...current, page: 1 }));
    },
    [],
  );

  const debouncedSearchTerm = useDebouncedValue(filters.search, 300);

  useEffect(() => {
    const effectiveStatus = isManager ? filters.status : 'PUBLISHED';
    const effectiveFilters = { status: effectiveStatus, search: debouncedSearchTerm };
    loadTopics(effectiveFilters, { page: pagination.page, pageSize: pagination.pageSize });
  }, [debouncedSearchTerm, filters.status, isManager, loadTopics, pagination.page, pagination.pageSize]);

  const paginator = useMemo(() => {
    const pages = Math.max(1, Math.ceil((state.total || 0) / pagination.pageSize));
    return { pages, hasNext: pagination.page < pages, hasPrevious: pagination.page > 1 };
  }, [pagination.page, pagination.pageSize, state.total]);

  const goToPage = useCallback(
    (page) => {
      const clamped = Math.max(1, page);
      setPagination((current) => ({ ...current, page: clamped }));
    },
    [],
  );

  const columns = useMemo(() => createTopicColumns({ showStatus: isManager }), [isManager]);

  const statusOptions = useMemo(() => {
    if (isManager) {
      return STATUS_FILTER_OPTIONS;
    }
    return STATUS_FILTER_OPTIONS.filter((option) => option.value === 'PUBLISHED');
  }, [isManager]);

  const emptyMessage = isManager
    ? 'No topics match the current filters.'
    : 'No published topics are available yet. Check back soon!';

  const rangeStart = state.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const rangeEnd = state.total > 0 ? Math.min(pagination.page * pagination.pageSize, state.total) : 0;

  const footerContent = (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground">
        {state.total > 0 ? (
          <>
            Showing {rangeStart}–{rangeEnd} of {state.total} topics
          </>
        ) : (
          'No topics to display'
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!paginator.hasPrevious} onClick={() => goToPage(pagination.page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {pagination.page} of {paginator.pages}</span>
        <Button variant="outline" size="sm" disabled={!paginator.hasNext} onClick={() => goToPage(pagination.page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );

  const title = isManager ? 'Topic Management' : 'Topic Library';
  const description = isManager
    ? 'Draft, review, and publish topics using the collaborative workflow.'
    : 'Browse published topics ready for learners across the Udoy network.';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Topic library</CardTitle>
            <CardDescription>
              {isManager
                ? 'Filter by workflow status and search across drafts.'
                : 'Search the catalog of published learning topics.'}
            </CardDescription>
          </div>
          {canCreate ? (
            <Button asChild>
              <Link to="/topics/new">
                <LucideIcon name="Plus" className="mr-2 h-4 w-4" /> New topic
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <LucideIcon name="Filter" className="h-4 w-4 text-neutral-500" />
              <Select value={filters.status} onValueChange={handleStatusChange} disabled={!isManager}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
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
          <DataTable
            columns={columns}
            data={state.items}
            loading={state.loading}
            emptyMessage={emptyMessage}
            loadingMessage="Loading topics..."
            filterColumn="title"
            enableInternalPagination={false}
            showSelectionSummary={false}
            footerContent={footerContent}
          />
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
