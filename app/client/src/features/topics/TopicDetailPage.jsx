import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui';
import { LucideIcon } from '@/shared/icons';
import RichTextEditor from '@/components/RichTextEditor.jsx';
import { useAuth } from '@/features/auth/AuthProvider.jsx';
import TopicStatusBadge from './components/TopicStatusBadge.jsx';
import {
  createTopicRevision,
  fetchTopicHistory,
  getTopic,
  publishTopic,
  reviewTopic,
  submitTopic,
} from './api.js';

const DECISIONS = [
  { value: 'APPROVED', label: 'Approve for publication' },
  { value: 'CHANGES_REQUESTED', label: 'Request changes' },
];

export default function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roles = useMemo(() => user?.roles || [], [user]);
  const isCreator = roles.includes('creator');
  const isAdmin = roles.includes('admin');
  const isValidator = roles.includes('teacher');

  const [topic, setTopic] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitComment, setSubmitComment] = useState('');
  const [reviewDecision, setReviewDecision] = useState(DECISIONS[0].value);
  const [reviewComment, setReviewComment] = useState('');
  const [publishComment, setPublishComment] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionState, setActionState] = useState({ submit: false, review: false, publish: false, revise: false });

  const canSubmit = useMemo(() => {
    if (!topic) return false;
    return (isCreator || isAdmin) && ['DRAFT', 'CHANGES_REQUESTED'].includes(topic.status);
  }, [isAdmin, isCreator, topic]);

  const canEditDraft = canSubmit;

  const canReview = useMemo(() => {
    if (!topic) return false;
    return (isValidator || isAdmin) && topic.status === 'IN_REVIEW';
  }, [isAdmin, isValidator, topic]);

  const canPublish = useMemo(() => {
    if (!topic) return false;
    return (isCreator || isAdmin) && topic.status === 'APPROVED';
  }, [isAdmin, isCreator, topic]);

  const canRevise = useMemo(() => {
    if (!topic) return false;
    return (isCreator || isAdmin) && topic.status === 'PUBLISHED';
  }, [isAdmin, isCreator, topic]);

  const loadTopic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopic(id);
      setTopic(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load topic.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetchTopicHistory(id);
      setHistory(response);
    } catch (err) {
      // Non-fatal; keep silent but log to console for developers
      // eslint-disable-next-line no-console
      console.error('Failed to load topic history', err);
    }
  }, [id]);

  useEffect(() => {
    loadTopic();
    loadHistory();
  }, [loadTopic, loadHistory]);

  const handleSubmitForReview = async () => {
    setActionState((current) => ({ ...current, submit: true }));
    setError(null);
    try {
      await submitTopic(id, { comment: submitComment });
      setSubmitComment('');
      await loadTopic();
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit topic for review.');
    } finally {
      setActionState((current) => ({ ...current, submit: false }));
    }
  };

  const handleReviewDecision = async () => {
    setActionState((current) => ({ ...current, review: true }));
    setError(null);
    try {
      await reviewTopic(id, {
        decision: reviewDecision,
        comment: reviewComment,
      });
      setReviewComment('');
      await loadTopic();
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to record review decision.');
    } finally {
      setActionState((current) => ({ ...current, review: false }));
    }
  };

  const handlePublish = async () => {
    setActionState((current) => ({ ...current, publish: true }));
    setError(null);
    try {
      await publishTopic(id, { comment: publishComment });
      setPublishComment('');
      await loadTopic();
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to publish topic.');
    } finally {
      setActionState((current) => ({ ...current, publish: false }));
    }
  };

  const handleRevision = async () => {
    setActionState((current) => ({ ...current, revise: true }));
    setError(null);
    try {
      const draft = await createTopicRevision(id, { notes: revisionNotes });
      navigate(`/topics/${draft.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create a new draft revision.');
    } finally {
      setActionState((current) => ({ ...current, revise: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24 text-muted-foreground">
        <LucideIcon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
        Loading topic…
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-24 text-center">
        <LucideIcon name="AlertTriangle" size="lg" className="text-destructive" />
        <h1 className="font-display text-3xl font-semibold text-black-olive">We couldn’t load that topic.</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="default" onClick={loadTopic}>
          Retry
        </Button>
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  const lastUpdated = topic.updatedAt ? format(new Date(topic.updatedAt), 'dd MMM yyyy • HH:mm') : '—';
  const lastUpdatedRelative = topic.updatedAt ? formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true }) : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <LucideIcon name="ArrowLeft" size="sm" />
            Back
          </Button>
          <TopicStatusBadge status={topic.status} />
          <Badge variant="outline" className="bg-muted text-xs font-medium">
            v{topic.version}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs uppercase text-muted-foreground">
            {topic.language}
          </Badge>
        </div>
        {canEditDraft && (
          <Button asChild variant="secondary">
            <Link to={`/topics/${topic.id}/edit`}>
              <LucideIcon name="Pencil" size="sm" />
              Edit Draft
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-black-olive">{topic.title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {topic.summary || 'No summary provided.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Updated {lastUpdated}</span>
            {lastUpdatedRelative && <span>({lastUpdatedRelative})</span>}
            {topic.submittedAt && (
              <span>
                Submitted {format(new Date(topic.submittedAt), 'dd MMM yyyy')} by {topic.submittedById || '—'}
              </span>
            )}
            {topic.publishedAt && (
              <span>
                Published {format(new Date(topic.publishedAt), 'dd MMM yyyy')} by {topic.publishedById || '—'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(topic.group?.tags || []).map((tag) => (
              <Badge key={`${tag.id}-${tag.name}`} variant="outline" className="bg-muted text-xs font-medium">
                {tag.name}
              </Badge>
            ))}
          </div>

          {(topic.metadata && Object.keys(topic.metadata).length > 0) && (
            <div className="rounded-xl border border-muted bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-semibold uppercase tracking-wide text-muted-foreground">Metadata</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {Object.entries(topic.metadata).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium text-black-olive">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(topic.group?.alignments || []).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Curriculum Alignments</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {topic.group.alignments.map((alignment) => (
                  <div key={alignment.id} className="rounded-xl border border-muted bg-background px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-2">
                      {alignment.framework && (
                        <Badge variant="outline" className="bg-muted text-xs font-medium">
                          {alignment.framework}
                        </Badge>
                      )}
                      {alignment.standardCode && (
                        <Badge variant="outline" className="bg-muted text-xs font-medium">
                          {alignment.standardCode}
                        </Badge>
                      )}
                      {alignment.gradeLevel && (
                        <Badge variant="outline" className="bg-muted text-xs font-medium">
                          Grade {alignment.gradeLevel}
                        </Badge>
                      )}
                    </div>
                    {alignment.description && <p className="mt-2 text-xs">{alignment.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topic Content</CardTitle>
          <CardDescription>Rendered from the draft editor in read-only mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor value={topic.content} valueFormat="json" readOnly />
        </CardContent>
      </Card>

      {(canSubmit || canReview || canPublish || canRevise) && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Actions</CardTitle>
            <CardDescription>Advance the topic through validation, publication, or revision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {canSubmit && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Submit for Review</h3>
                <Textarea
                  rows={3}
                  placeholder="Share context for validators (optional)"
                  value={submitComment}
                  onChange={(event) => setSubmitComment(event.target.value)}
                />
                <Button onClick={handleSubmitForReview} disabled={actionState.submit}>
                  {actionState.submit && <LucideIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Draft
                </Button>
              </div>
            )}

            {canReview && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Review Decision</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="review-decision">Decision</Label>
                    <Select value={reviewDecision} onValueChange={setReviewDecision}>
                      <SelectTrigger id="review-decision">
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        {DECISIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Comment</Label>
                    <Textarea
                      id="review-comment"
                      rows={3}
                      placeholder="Highlight rubric scores, accessibility feedback, or required edits."
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleReviewDecision} disabled={actionState.review}>
                  {actionState.review && <LucideIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
                  Record Decision
                </Button>
              </div>
            )}

            {canPublish && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Publish Topic</h3>
                <Textarea
                  rows={3}
                  placeholder="Release notes or launch context (optional)"
                  value={publishComment}
                  onChange={(event) => setPublishComment(event.target.value)}
                />
                <Button onClick={handlePublish} disabled={actionState.publish}>
                  {actionState.publish && <LucideIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
                  Publish
                </Button>
              </div>
            )}

            {canRevise && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Create Revision Draft</h3>
                <Textarea
                  rows={3}
                  placeholder="Describe what needs to change in the next revision."
                  value={revisionNotes}
                  onChange={(event) => setRevisionNotes(event.target.value)}
                />
                <Button onClick={handleRevision} disabled={actionState.revise}>
                  {actionState.revise && <LucideIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
                  Start New Draft
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Workflow History</CardTitle>
          <CardDescription>Review the journey across versions, reviews, and publications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Version Timeline</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((version) => (
                  <TableRow key={version.id} className={version.id === topic.id ? 'bg-muted/50' : undefined}>
                    <TableCell className="font-mono text-sm">v{version.version}</TableCell>
                    <TableCell>
                      <TopicStatusBadge status={version.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {version.updatedAt ? format(new Date(version.updatedAt), 'dd MMM yyyy • HH:mm') : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{version.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {topic.reviews?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Review Decisions</h3>
              <div className="space-y-3">
                {topic.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-muted bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <TopicStatusBadge status={review.decision === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED'} />
                      <span>by {review.actorId || '—'}</span>
                      <span>{format(new Date(review.createdAt), 'dd MMM yyyy • HH:mm')}</span>
                    </div>
                    {review.comment && <p className="mt-2 text-xs">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="ghost" onClick={() => { loadTopic(); loadHistory(); }}>
            <LucideIcon name="RefreshCw" size="sm" className="mr-2" />
            Refresh History
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
