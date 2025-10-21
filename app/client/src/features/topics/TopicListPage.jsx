import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
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
  Badge,
} from '@components/ui';
import { LucideIcon } from '@/shared/icons';
import { useAuth } from '@/features/auth/AuthProvider.jsx';
import TopicStatusBadge from './components/TopicStatusBadge.jsx';
import { fetchTopics } from './api.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'CHANGES_REQUESTED', label: 'Changes Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const PAGE_SIZE = 20;

export default function TopicListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roles = useMemo(() => user?.roles || [], [user]);
  const canCreate = roles.includes('creator') || roles.includes('admin');

  const [filters, setFilters] = useState({ status: 'all', search: '', language: '' });
  const [page, setPage] = useState(1);
  const [topics, setTopics] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        pageSize: PAGE_SIZE,
      };

      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.search) {
        params.search = filters.search.trim();
      }

      if (filters.language) {
        params.language = filters.language.trim();
      }

      const response = await fetchTopics(params);
      setTopics(response.items || []);
      setMeta({
        page: response.page || page,
        pageSize: response.pageSize || PAGE_SIZE,
        total: response.total || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load topics.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const totalPages = useMemo(() => {
    if (!meta.total) {
      return 1;
    }

    return Math.max(1, Math.ceil(meta.total / (meta.pageSize || PAGE_SIZE)));
  }, [meta.total, meta.pageSize]);

  const handleReset = () => {
    setFilters({ status: 'all', search: '', language: '' });
    setPage(1);
  };

  const handleCreate = () => {
    navigate('/topics/new');
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-black-olive">Topic Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Author, review, and publish rich learning topics with structured workflows.
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate} variant="default" className="shadow-sm">
            <LucideIcon name="Plus" size="sm" />
            New Topic
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the catalog by status, language, or keyword.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="topic-search">
              Search
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="topic-search"
                placeholder="Search by title or summary"
                value={filters.search}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, search: event.target.value }));
                  setPage(1);
                }}
              />
              <Button variant="ghost" onClick={loadTopics} disabled={loading}>
                <LucideIcon name="Search" size="sm" />
                <span className="sr-only">Run search</span>
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="topic-language">
              Language
            </label>
            <Input
              id="topic-language"
              placeholder="e.g. en, es"
              value={filters.language}
              onChange={(event) => {
                setFilters((current) => ({ ...current, language: event.target.value }));
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((current) => ({ ...current, status: value }));
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
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
          <div className="md:col-span-4 flex flex-wrap items-center gap-3">
            <Button variant="subtle" onClick={loadTopics} disabled={loading}>
              <LucideIcon name="RefreshCw" size="sm" className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={
                loading || (filters.status === 'all' && !filters.search && !filters.language)
              }
            >
              Clear
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {(topics || []).length} of {meta.total} topics
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topic Catalog</CardTitle>
          <CardDescription>
            Track drafts, translation variants, review status, and publication readiness in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <LucideIcon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
              Loading topics…
            </div>
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
              <LucideIcon name="NotebookPen" size="lg" className="text-muted-foreground/70" />
              <p className="max-w-md text-sm">
                No topics match the current filters. Try adjusting your search terms or start a new draft to begin authoring.
              </p>
              {canCreate && (
                <Button onClick={handleCreate}>
                  <LucideIcon name="Plus" size="sm" />
                  Create your first topic
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => {
                  const updatedAt = topic.updatedAt ? format(new Date(topic.updatedAt), 'dd MMM yyyy') : '—';
                  return (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Link
                            to={`/topics/${topic.id}`}
                            className="font-semibold text-black-olive transition hover:text-evergreen"
                          >
                            {topic.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{topic.summary || 'No summary provided.'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm uppercase text-muted-foreground">{topic.language}</TableCell>
                      <TableCell>
                        <TopicStatusBadge status={topic.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          v{topic.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{updatedAt}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {(topic.group?.tags || []).slice(0, 3).map((tag) => (
                            <Badge key={`${topic.id}-${tag.id}`} variant="outline" className="bg-muted text-xs font-medium">
                              {tag.name}
                            </Badge>
                          ))}
                          {topic.group?.tags?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{topic.group.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/topics/${topic.id}`}>View</Link>
                          </Button>
                          {canCreate && (
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/topics/${topic.id}/edit`}>Edit</Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {topics.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-4 text-sm text-muted-foreground md:flex-row">
              <div>
                Page {meta.page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <LucideIcon name="ChevronLeft" size="sm" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.page >= totalPages || loading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                  <LucideIcon name="ChevronRight" size="sm" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
