import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@components/ui';
import { LucideIcon } from '@icons';
import RichTextEditor from '@/components/RichTextEditor.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import topicsApi from './api.js';
import { DEFAULT_EDITOR_CONTENT } from '../../../../shared/editor/constants.js';
import { uploadEditorAsset } from '../../../../shared/editor/index.js';
import { buildApiUrl } from '@/lib/api.js';

const STATUS_LABELS = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In review',
  CHANGES_REQUESTED: 'Changes requested',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

const STATUS_COLORS = {
  DRAFT: 'bg-neutral-200 text-neutral-800',
  IN_REVIEW: 'bg-support-sky text-support-forest',
  CHANGES_REQUESTED: 'bg-destructive/10 text-destructive',
  APPROVED: 'bg-secondary text-secondary-foreground',
  PUBLISHED: 'bg-ecru text-black-olive',
  ARCHIVED: 'bg-neutral-200 text-neutral-600',
};

const COMMENT_TYPES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'CHANGE_REQUEST', label: 'Change request' },
];

const EDITABLE_STATUSES = [
  'DRAFT',
  'CHANGES_REQUESTED',
  'IN_REVIEW',
];

function StatusBadge({ status }) {
  if (!status) {
    return null;
  }
  const tone = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return <Badge className={tone}>{STATUS_LABELS[status] || status}</Badge>;
}

function buildTagsFromText(text) {
  if (!text) {
    return [];
  }

  return Array.from(
    new Set(
      text
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).map((label) => ({
    label,
    slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  }));
}

function buildFormFromTopic(topic) {
  if (!topic) {
    return {
      title: '',
      summary: '',
      language: 'en',
      tagsText: '',
      baseTopicId: '',
      changeNotes: '',
      accessibilityNotes: '',
      metadataGradeBand: '',
      metadataDuration: '',
      content: DEFAULT_EDITOR_CONTENT,
    };
  }

  const tagsText = Array.isArray(topic.tags)
    ? topic.tags.map((tag) => tag.label || tag.slug).filter(Boolean).join('\n')
    : '';

  return {
    title: topic.title || '',
    summary: topic.summary || '',
    language: topic.language || 'en',
    tagsText,
    baseTopicId: topic.baseTopicId || '',
    changeNotes: '',
    accessibilityNotes: topic.accessibility?.notes || '',
    metadataGradeBand: topic.metadata?.gradeBand || '',
    metadataDuration:
      typeof topic.metadata?.durationMinutes === 'number'
        ? String(topic.metadata.durationMinutes)
        : '',
    content: topic.content || DEFAULT_EDITOR_CONTENT,
  };
}

function buildPayloadFromForm(form) {
  const payload = {
    title: form.title,
    summary: form.summary,
    language: form.language,
    contentFormat: 'JSON',
    content: form.content || DEFAULT_EDITOR_CONTENT,
    tags: buildTagsFromText(form.tagsText),
    baseTopicId: form.baseTopicId || undefined,
  };

  if (form.changeNotes) {
    payload.changeNotes = form.changeNotes;
  }

  if (form.accessibilityNotes) {
    payload.accessibility = { notes: form.accessibilityNotes };
  }

  const metadata = {};
  if (form.metadataGradeBand) {
    metadata.gradeBand = form.metadataGradeBand;
  }
  if (form.metadataDuration) {
    const parsed = Number.parseInt(form.metadataDuration, 10);
    if (!Number.isNaN(parsed)) {
      metadata.durationMinutes = parsed;
    }
  }
  if (Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }

  return payload;
}

function buildAssetDescriptor(file, upload) {
  const mime = file.type || '';
  if (mime.startsWith('image/')) {
    return { type: 'image', src: upload.url, attrs: { alt: file.name } };
  }
  if (mime.startsWith('video/')) {
    return { type: 'video', src: upload.url };
  }
  if (mime.startsWith('audio/')) {
    return { type: 'audio', src: upload.url, attrs: { title: file.name } };
  }
  return { type: 'file', href: upload.url, text: file.name };
}

export default function TopicEditorPage() {
  const { topicId } = useParams();
  const isNew = !topicId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const roles = useMemo(() => user?.roles || [], [user]);
  const isAdmin = roles.includes('admin');
  const isCreator = roles.includes('creator') || isAdmin;
  const isValidator = roles.includes('teacher') || isAdmin;
  const isManager = isAdmin || isCreator || isValidator;
  const canComment = isCreator || isValidator || isAdmin;

  const [topic, setTopic] = useState(null);
  const [form, setForm] = useState(buildFormFromTopic(null));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [commentForm, setCommentForm] = useState({ body: '', type: 'REVIEW' });
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState('approve');
  const [accessDenied, setAccessDenied] = useState(false);

  const apiBaseUrl = useMemo(() => buildApiUrl(), []);

  const canEdit = useMemo(() => {
    if (isNew) {
      return isCreator;
    }
    if (!topic) {
      return false;
    }
    return EDITABLE_STATUSES.includes(topic.status) && (isCreator || isValidator || isAdmin);
  }, [isNew, topic, isCreator, isValidator, isAdmin]);

  const canSubmit = useMemo(() => {
    if (!topic) {
      return false;
    }
    return isCreator && ['DRAFT', 'CHANGES_REQUESTED'].includes(topic.status);
  }, [topic, isCreator]);

  const canReview = useMemo(() => {
    if (!topic) {
      return false;
    }
    return isValidator && topic.status === 'IN_REVIEW';
  }, [topic, isValidator]);

  const canPublish = useMemo(() => {
    if (!topic) {
      return false;
    }
    return isAdmin && ['APPROVED', 'PUBLISHED'].includes(topic.status);
  }, [topic, isAdmin]);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text, id: Date.now() });
  }, []);

  const refreshTopic = useCallback(
    async (id = topicId) => {
      if (!id) {
        return;
      }
      setLoading(true);
      try {
        setAccessDenied(false);
        const data = await topicsApi.getTopic(id, { full: true });
        setTopic(data);
        setForm(buildFormFromTopic(data));
      } catch (error) {
        console.error('Failed to load topic', error);
        if (error?.response?.status === 403) {
          setAccessDenied(true);
        } else {
          showMessage('error', 'Unable to load the topic. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [showMessage, topicId],
  );

  useEffect(() => {
    if (isNew) {
      setTopic(null);
      setForm(buildFormFromTopic(null));
      setLoading(false);
      setAccessDenied(false);
      return;
    }
    refreshTopic(topicId);
  }, [isNew, topicId, refreshTopic]);

  useEffect(() => {
    if (!isNew && topic && !isManager && topic.status !== 'PUBLISHED' && !accessDenied) {
      setAccessDenied(true);
    }
  }, [accessDenied, isManager, isNew, topic]);

  const handleChange = useCallback((field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const handleEditorChange = useCallback((value) => {
    setForm((current) => ({ ...current, content: value }));
  }, []);

  const handleAssetRequest = useCallback(
    async (files) => {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const upload = await uploadEditorAsset(file, { apiBaseUrl });
          return buildAssetDescriptor(file, upload);
        }),
      );
      return uploads;
    },
    [apiBaseUrl],
  );

  const handleAssetError = useCallback(
    (error) => {
      console.error('Asset upload failed', error);
      showMessage('error', 'Uploading media to the lesson failed. Please retry.');
    },
    [showMessage],
  );

  const handleSave = useCallback(
    async () => {
      if (!canEdit) {
        return;
      }
      setSaving(true);
      try {
        const payload = buildPayloadFromForm(form);
        if (isNew) {
          const created = await topicsApi.createTopic(payload);
          showMessage('success', 'Draft created successfully.');
          navigate(`/topics/${created.id}`, { replace: true });
        } else {
          await topicsApi.updateTopic(topic.id, payload);
          showMessage('success', 'Draft updated successfully.');
          await refreshTopic(topic.id);
        }
      } catch (error) {
        console.error('Failed to save topic', error);
        showMessage('error', 'Saving the topic failed. Please review your inputs.');
      } finally {
        setSaving(false);
      }
    },
    [canEdit, form, isNew, navigate, refreshTopic, showMessage, topic],
  );

  const handleSubmitForReview = useCallback(
    async () => {
      if (!topic || !canSubmit) {
        return;
      }
      setSubmitLoading(true);
      try {
        await topicsApi.submitTopic(topic.id, form.changeNotes ? { note: form.changeNotes } : {});
        showMessage('success', 'Topic submitted for review.');
        await refreshTopic(topic.id);
      } catch (error) {
        console.error('Failed to submit topic for review', error);
        showMessage('error', 'Submitting for review failed.');
      } finally {
        setSubmitLoading(false);
      }
    },
    [topic, canSubmit, form.changeNotes, refreshTopic, showMessage],
  );

  const handleReviewAction = useCallback(
    async (decisionOverride) => {
      if (!topic || !canReview) {
        return;
      }
      setReviewLoading(true);
      try {
        const decision = decisionOverride || reviewDecision;
        await topicsApi.reviewTopic(topic.id, {
          decision,
          notes: reviewNotes,
        });
        showMessage('success', `Review decision "${decision}" recorded.`);
        setReviewNotes('');
        await refreshTopic(topic.id);
      } catch (error) {
        console.error('Failed to apply review decision', error);
        showMessage('error', 'Unable to record the review decision.');
      } finally {
        setReviewLoading(false);
      }
    },
    [topic, canReview, reviewDecision, reviewNotes, refreshTopic, showMessage],
  );

  const handlePublish = useCallback(
    async () => {
      if (!topic || !canPublish) {
        return;
      }
      setPublishLoading(true);
      try {
        await topicsApi.publishTopic(topic.id, form.changeNotes ? { note: form.changeNotes } : {});
        showMessage('success', 'Topic published successfully.');
        await refreshTopic(topic.id);
      } catch (error) {
        console.error('Failed to publish topic', error);
        showMessage('error', 'Publishing failed.');
      } finally {
        setPublishLoading(false);
      }
    },
    [topic, canPublish, form.changeNotes, refreshTopic, showMessage],
  );

  const handleAddComment = useCallback(
    async () => {
      if (!topic || !canComment || !commentForm.body.trim()) {
        return;
      }
      try {
        const comment = await topicsApi.addTopicComment(topic.id, {
          body: commentForm.body,
          type: commentForm.type,
        });
        setCommentForm((current) => ({ ...current, body: '' }));
        setTopic((current) => ({
          ...current,
          comments: [...(current?.comments || []), comment],
        }));
        showMessage('success', 'Comment added to the review thread.');
      } catch (error) {
        console.error('Failed to add comment', error);
        showMessage('error', 'Unable to add the comment.');
      }
    },
    [topic, commentForm.body, commentForm.type, canComment, showMessage],
  );

  const workflowEvents = useMemo(() => topic?.workflow || [], [topic]);
  const comments = useMemo(() => topic?.comments || [], [topic]);

  if (accessDenied) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/topics')}>
              <LucideIcon name="ArrowLeft" className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-semibold text-slate-900">Topic unavailable</h1>
              <p className="text-sm text-neutral-600">
                This topic is not published yet. Only published topics are visible for your role.
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Published content only</CardTitle>
              <CardDescription>
                Please return to the topic library to explore published lessons available to learners.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/topics')}>
                <LucideIcon name="BookOpen" className="mr-2 h-4 w-4" /> Back to topics
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/topics')}>
                <LucideIcon name="ArrowLeft" className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-display text-3xl font-semibold text-slate-900">
                  {isNew ? 'Create topic' : form.title || 'Topic editor'}
                </h1>
                <p className="text-sm text-neutral-600">
                  Use the block editor to assemble multimedia-rich topics and manage workflow actions.
                </p>
              </div>
            </div>
            {!isNew && (
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={topic?.status} />
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Updated {topic?.updatedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(topic.updatedAt)) : 'recently'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canReview && (
              <>
                <Button
                  variant="outline"
                  disabled={reviewLoading}
                  onClick={() => handleReviewAction('changes_requested')}
                >
                  Request changes
                </Button>
                <Button disabled={reviewLoading} onClick={() => handleReviewAction('approve')}>
                  Approve
                </Button>
              </>
            )}
            {canPublish && (
              <Button disabled={publishLoading} onClick={handlePublish}>
                {topic?.status === 'PUBLISHED' ? 'Republish update' : 'Publish topic'}
              </Button>
            )}
            {canSubmit && (
              <Button variant="secondary" disabled={submitLoading} onClick={handleSubmitForReview}>
                Submit for review
              </Button>
            )}
            {canEdit && (
              <Button disabled={saving} onClick={handleSave}>
                {isNew ? 'Save draft' : 'Update draft'}
              </Button>
            )}
          </div>
        </header>

        {message && (
          <Card className={message.type === 'error' ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'}>
            <CardContent className="flex items-center gap-3 py-4 text-sm">
              <LucideIcon
                name={message.type === 'error' ? 'AlertTriangle' : 'CheckCircle2'}
                className={message.type === 'error' ? 'h-5 w-5 text-rose-600' : 'h-5 w-5 text-emerald-600'}
              />
              <span>{message.text}</span>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)] lg:items-start">
          <section className="flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  Build the lesson with rich text, embedded media, and attachments. Drag and drop images or videos to upload
                  them to secure storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col">
                <RichTextEditor
                  value={form.content}
                  valueFormat="json"
                  onChange={handleEditorChange}
                  readOnly={!canEdit}
                  onAssetsRequest={handleAssetRequest}
                  onAssetsError={handleAssetError}
                  placeholder="Introduce learning goals, add instructions, and embed supporting media."
                  className="flex flex-1 flex-col"
                  editorClassName="min-h-[600px]"
                />
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Topic metadata</CardTitle>
                <CardDescription>Title, summary, language, and tagging used for catalog discovery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="topic-title">Title</Label>
                    <Input
                      id="topic-title"
                      value={form.title}
                      onChange={handleChange('title')}
                      placeholder="E.g. Understanding Fractions"
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic-language">Language</Label>
                    <Input
                      id="topic-language"
                      value={form.language}
                      onChange={handleChange('language')}
                      placeholder="en"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic-summary">Summary</Label>
                  <Textarea
                    id="topic-summary"
                    value={form.summary}
                    onChange={handleChange('summary')}
                    placeholder="Add a concise summary to help reviewers understand the lesson flow."
                    className="min-h-[120px]"
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="topic-tags">Tags (one per line)</Label>
                    <Textarea
                      id="topic-tags"
                      value={form.tagsText}
                      onChange={handleChange('tagsText')}
                      placeholder="numeracy\nfractions\nclassroom"
                      className="min-h-[96px]"
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-neutral-500">
                      Tags support classification, curriculum alignment, and accessibility filters.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic-base">Base topic ID (for translations)</Label>
                    <Input
                      id="topic-base"
                      value={form.baseTopicId}
                      onChange={handleChange('baseTopicId')}
                      placeholder="Leave blank unless this is a translated variant"
                      disabled={!canEdit}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="topic-grade">Target grade band</Label>
                        <Input
                          id="topic-grade"
                          value={form.metadataGradeBand}
                          onChange={handleChange('metadataGradeBand')}
                          placeholder="Grades 4-5"
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="topic-duration">Duration (minutes)</Label>
                        <Input
                          id="topic-duration"
                          value={form.metadataDuration}
                          onChange={handleChange('metadataDuration')}
                          placeholder="45"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility and workflow notes</CardTitle>
                <CardDescription>Capture accessibility accommodations and submit change notes for reviewers.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="topic-accessibility">Accessibility notes</Label>
                  <Textarea
                    id="topic-accessibility"
                    value={form.accessibilityNotes}
                    onChange={handleChange('accessibilityNotes')}
                    placeholder="Describe captions, alt text coverage, and learner accommodations."
                    className="min-h-[120px]"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic-change-notes">Change / submission notes</Label>
                  <Textarea
                    id="topic-change-notes"
                    value={form.changeNotes}
                    onChange={handleChange('changeNotes')}
                    placeholder="Summarize major updates for validators and publishers."
                    className="min-h-[120px]"
                    disabled={!(canEdit || canSubmit || canPublish)}
                  />
                  {canReview && (
                    <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <Label htmlFor="topic-review-notes">Review notes</Label>
                      <Textarea
                        id="topic-review-notes"
                        value={reviewNotes}
                        onChange={(event) => setReviewNotes(event.target.value)}
                        placeholder="Record approval notes or requested changes."
                        className="min-h-[96px]"
                      />
                      <Select value={reviewDecision} onValueChange={setReviewDecision}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="changes_requested">Request changes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!loading ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow history</CardTitle>
                    <CardDescription>Every status transition is tracked for auditing and version history.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workflowEvents.length === 0 ? (
                      <p className="text-sm text-neutral-600">Workflow activity will appear once the draft is submitted.</p>
                    ) : (
                      <div className="space-y-4">
                        {workflowEvents.map((event) => (
                          <div key={event.id} className="rounded-xl border border-neutral-200 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={event.toStatus} />
                                <span className="text-xs text-neutral-500">
                                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                                    new Date(event.createdAt),
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-neutral-500">
                                {event.actor?.firstName || event.actor?.email || 'System'}
                              </span>
                            </div>
                            {event.note && <p className="pt-2 text-sm text-neutral-700">{event.note}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Review comments</CardTitle>
                    <CardDescription>Collaborate asynchronously with validators and creators.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-sm text-neutral-600">
                        No comments yet. Start the conversation with clear, actionable feedback.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{comment.type.replace(/_/g, ' ')}</Badge>
                                <span className="text-xs text-neutral-500">
                                  {comment.author?.firstName || comment.author?.email || 'Contributor'}
                                </span>
                              </div>
                              <span className="text-xs text-neutral-500">
                                {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                                  new Date(comment.createdAt),
                                )}
                              </span>
                            </div>
                            <p className="pt-2 text-sm text-neutral-700">{comment.body}</p>
                            {comment.resolvedAt && (
                              <p className="pt-1 text-xs text-emerald-600">
                                Resolved {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                                  new Date(comment.resolvedAt),
                                )}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {canComment ? (
                    <>
                      <Separator className="mx-6" />
                      <CardFooter className="flex flex-col gap-3">
                        <Label htmlFor="comment-body">Add comment</Label>
                        <Textarea
                          id="comment-body"
                          value={commentForm.body}
                          onChange={(event) => setCommentForm((current) => ({ ...current, body: event.target.value }))}
                          placeholder="Share context, requests, or feedback for collaborators."
                          className="min-h-[100px]"
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <Select
                            value={commentForm.type}
                            onValueChange={(value) => setCommentForm((current) => ({ ...current, type: value }))}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Comment type" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMMENT_TYPES.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" onClick={handleAddComment} disabled={!commentForm.body.trim()}>
                            Add comment
                          </Button>
                        </div>
                      </CardFooter>
                    </>
                  ) : null}
                </Card>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
                Loading topic details…
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
