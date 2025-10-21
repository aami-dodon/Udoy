import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from '@components/ui';
import { LucideIcon } from '@/shared/icons';
import RichTextEditor from '@/components/RichTextEditor.jsx';
import { useAuth } from '@/features/auth/AuthProvider.jsx';
import { DEFAULT_EDITOR_CONTENT } from '../../../../shared/editor/index.js';
import { uploadEditorAsset } from '../../../../shared/editor/upload.js';
import { buildApiUrl } from '@/lib/api.js';
import TopicStatusBadge from './components/TopicStatusBadge.jsx';
import {
  createTopic,
  getTopic,
  updateTopic,
} from './api.js';

const TAG_TYPES = [
  { value: 'subject', label: 'Subject' },
  { value: 'grade', label: 'Grade' },
  { value: 'competency', label: 'Competency' },
  { value: 'curriculum', label: 'Curriculum' },
];

const defaultValues = {
  title: '',
  language: 'en',
  summary: '',
  readingLevel: '',
  curriculumNotes: '',
  accessibilitySummary: '',
};

function toNonEmptyObject(entries) {
  return Object.entries(entries).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      acc[key] = typeof value === 'string' ? value.trim() : value;
    }
    return acc;
  }, {});
}

export default function TopicEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const roles = useMemo(() => user?.roles || [], [user]);
  const canManage = roles.includes('creator') || roles.includes('admin');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState(null);
  const [content, setContent] = useState(DEFAULT_EDITOR_CONTENT);
  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState({ name: '', type: TAG_TYPES[0].value });
  const [alignments, setAlignments] = useState([]);
  const [alignmentDraft, setAlignmentDraft] = useState({ framework: '', standardCode: '', gradeLevel: '', description: '' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTopic(id);
        if (!isMounted) return;
        setTopic(data);
        reset({
          title: data.title || '',
          language: data.language || 'en',
          summary: data.summary || '',
          readingLevel: data.metadata?.readingLevel || '',
          curriculumNotes: data.metadata?.curriculumNotes || '',
          accessibilitySummary: data.accessibility?.summary || data.accessibility?.notes || '',
        });
        setContent(data.content || DEFAULT_EDITOR_CONTENT);
        setTags((data.group?.tags || []).map((tag) => ({ id: tag.id, name: tag.name, type: tag.type })));
        setAlignments((data.group?.alignments || []).map((alignment) => ({
          id: alignment.id,
          framework: alignment.framework || '',
          standardCode: alignment.standardCode || '',
          gradeLevel: alignment.gradeLevel || '',
          description: alignment.description || '',
        })));
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Unable to load topic.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit, reset]);

  const handleAssetsRequest = useCallback(
    async (files) => {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const upload = await uploadEditorAsset(file, {
            apiBaseUrl: buildApiUrl(''),
            prefix: 'topics',
          });

          const baseAsset = {
            href: upload.url,
            src: upload.url,
            text: file.name,
            attrs: { title: file.name },
          };

          if (file.type.startsWith('image/')) {
            return { ...baseAsset, type: 'image', attrs: { ...baseAsset.attrs, alt: file.name } };
          }

          if (file.type.startsWith('video/')) {
            return { ...baseAsset, type: 'video' };
          }

          return { ...baseAsset, type: 'file' };
        })
      );

      return uploads;
    },
    []
  );

  const handleAddTag = (event) => {
    event.preventDefault();
    if (!tagDraft.name.trim()) {
      return;
    }

    const exists = tags.some(
      (tag) => tag.name.toLowerCase() === tagDraft.name.trim().toLowerCase() && tag.type === tagDraft.type
    );
    if (exists) {
      setTagDraft({ name: '', type: tagDraft.type });
      return;
    }

    setTags((current) => [...current, { ...tagDraft, name: tagDraft.name.trim() }]);
    setTagDraft({ name: '', type: tagDraft.type });
  };

  const handleRemoveTag = (target) => {
    setTags((current) => current.filter((tag) => !(tag.name === target.name && tag.type === target.type)));
  };

  const handleAddAlignment = (event) => {
    event.preventDefault();
    if (!alignmentDraft.framework.trim() && !alignmentDraft.standardCode.trim()) {
      return;
    }

    setAlignments((current) => [
      ...current,
      {
        framework: alignmentDraft.framework.trim(),
        standardCode: alignmentDraft.standardCode.trim(),
        gradeLevel: alignmentDraft.gradeLevel.trim(),
        description: alignmentDraft.description.trim(),
      },
    ]);
    setAlignmentDraft({ framework: '', standardCode: '', gradeLevel: '', description: '' });
  };

  const handleRemoveAlignment = (index) => {
    setAlignments((current) => current.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (values) => {
    setSaving(true);
    setError(null);

    try {
      const metadata = toNonEmptyObject({
        readingLevel: values.readingLevel,
        curriculumNotes: values.curriculumNotes,
      });

      const accessibility = toNonEmptyObject({
        summary: values.accessibilitySummary,
      });

      const payload = {
        groupId: topic?.groupId,
        language: values.language,
        title: values.title,
        summary: values.summary,
        content,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        accessibility: Object.keys(accessibility).length > 0 ? accessibility : undefined,
        tags,
        alignments,
      };

      const response = isEdit ? await updateTopic(id, payload) : await createTopic(payload);
      const nextId = response?.id || id;
      navigate(`/topics/${nextId}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save topic.');
    } finally {
      setSaving(false);
    }
  };

  const summaryValue = watch('summary');

  if (!canManage) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
        <LucideIcon name="ShieldOff" size="lg" className="text-muted-foreground" />
        <h1 className="font-display text-3xl font-semibold text-black-olive">You do not have authoring access.</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Topic authoring tools are limited to creators and administrators. Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24 text-muted-foreground">
        <LucideIcon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
        Preparing editor…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <LucideIcon name="ArrowLeft" size="sm" />
            Back
          </Button>
          {topic?.status && <TopicStatusBadge status={topic.status} />}
        </div>
        <h1 className="font-display text-3xl font-semibold text-black-olive">
          {isEdit ? 'Edit Topic Draft' : 'Create New Topic'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Use the rich text canvas to build structured, accessible learning content. Attach multimedia assets, align to curriculum standards, and capture accessibility metadata before submission.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Topic Metadata</CardTitle>
            <CardDescription>Provide the structural details and quick reference context for reviewers.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Title</Label>
              <Input
                id="topic-title"
                placeholder="e.g. Solar System Basics"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-language">Language</Label>
              <Input
                id="topic-language"
                placeholder="en"
                {...register('language', { required: 'Language is required' })}
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">Use ISO language codes (e.g. en, es, hi).</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="topic-summary">Summary</Label>
              <Textarea
                id="topic-summary"
                rows={3}
                placeholder="One sentence synopsis that appears in search and review dashboards."
                {...register('summary')}
              />
              <p className="text-xs text-muted-foreground">
                {summaryValue?.length || 0} characters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authoring Canvas</CardTitle>
            <CardDescription>Compose structured content with headings, media, and attachments. Assets upload directly to MinIO.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RichTextEditor
              value={content}
              valueFormat="json"
              onChange={(next) => setContent(next)}
              onAssetsRequest={handleAssetsRequest}
              placeholder="Start drafting your learning experience…"
            />
            <div className="rounded-xl border border-muted bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <p className="font-semibold uppercase tracking-wide text-muted-foreground">Accessibility Tip</p>
              <p>
                Ensure embedded videos include captions and transcripts. Use descriptive alt text for all imagery and reference tactile alternatives when possible.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags & Classification</CardTitle>
            <CardDescription>Attach discoverability metadata for search, personalization, and curation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags added yet.</p>}
              {tags.map((tag) => (
                <Badge key={`${tag.type}-${tag.name}`} variant="outline" className="flex items-center gap-2">
                  <span className="font-medium text-black-olive">{tag.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tag.type}
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground transition hover:text-destructive"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <LucideIcon name="X" size="xs" />
                  </button>
                </Badge>
              ))}
            </div>
            <form className="grid gap-3 md:grid-cols-4" onSubmit={handleAddTag}>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="tag-name">Tag name</Label>
                <Input
                  id="tag-name"
                  value={tagDraft.name}
                  onChange={(event) => setTagDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Astronomy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-type">Type</Label>
                <Select
                  value={tagDraft.type}
                  onValueChange={(value) => setTagDraft((current) => ({ ...current, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="secondary" className="w-full">
                  <LucideIcon name="Plus" size="sm" />
                  Add Tag
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curriculum Alignments</CardTitle>
            <CardDescription>Map the topic to official frameworks, standards, and grade-level expectations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {alignments.length === 0 && <p className="text-sm text-muted-foreground">No alignments specified.</p>}
              {alignments.map((alignment, index) => (
                <div
                  key={`${alignment.framework}-${alignment.standardCode}-${index}`}
                  className="rounded-xl border border-muted bg-background px-4 py-3 text-sm text-muted-foreground"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveAlignment(index)}
                    >
                      <LucideIcon name="Trash2" size="sm" />
                      Remove
                    </Button>
                  </div>
                  {alignment.description && (
                    <p className="mt-2 text-xs text-muted-foreground">{alignment.description}</p>
                  )}
                </div>
              ))}
            </div>
            <form className="grid gap-3 md:grid-cols-5" onSubmit={handleAddAlignment}>
              <div className="space-y-2">
                <Label htmlFor="alignment-framework">Framework</Label>
                <Input
                  id="alignment-framework"
                  value={alignmentDraft.framework}
                  onChange={(event) => setAlignmentDraft((current) => ({ ...current, framework: event.target.value }))}
                  placeholder="NGSS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alignment-code">Standard Code</Label>
                <Input
                  id="alignment-code"
                  value={alignmentDraft.standardCode}
                  onChange={(event) => setAlignmentDraft((current) => ({ ...current, standardCode: event.target.value }))}
                  placeholder="MS-ESS1-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alignment-grade">Grade Level</Label>
                <Input
                  id="alignment-grade"
                  value={alignmentDraft.gradeLevel}
                  onChange={(event) => setAlignmentDraft((current) => ({ ...current, gradeLevel: event.target.value }))}
                  placeholder="6"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="alignment-description">Description</Label>
                <Input
                  id="alignment-description"
                  value={alignmentDraft.description}
                  onChange={(event) => setAlignmentDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Alignment context or learning objective"
                />
              </div>
              <div className="md:col-span-5 flex justify-end">
                <Button type="submit" variant="secondary">
                  <LucideIcon name="Plus" size="sm" />
                  Add Alignment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility & Notes</CardTitle>
            <CardDescription>Capture accommodations, alternate formats, and editorial notes for reviewers.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reading-level">Reading Level</Label>
              <Input
                id="reading-level"
                placeholder="Grade 6"
                {...register('readingLevel')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curriculum-notes">Curriculum Notes</Label>
              <Input
                id="curriculum-notes"
                placeholder="Unit 2 launch / Term 1"
                {...register('curriculumNotes')}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="accessibility-summary">Accessibility Summary</Label>
              <Textarea
                id="accessibility-summary"
                rows={3}
                placeholder="List captions, transcripts, and any accommodations included in this topic."
                {...register('accessibilitySummary')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border/60">
            <p className="text-sm text-muted-foreground">
              All changes are saved as drafts until you submit for review.
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (topic) {
                    reset({
                      title: topic.title || '',
                      language: topic.language || 'en',
                      summary: topic.summary || '',
                      readingLevel: topic.metadata?.readingLevel || '',
                      curriculumNotes: topic.metadata?.curriculumNotes || '',
                      accessibilitySummary: topic.accessibility?.summary || topic.accessibility?.notes || '',
                    });
                    setContent(topic.content || DEFAULT_EDITOR_CONTENT);
                    setTags((topic.group?.tags || []).map((tag) => ({ id: tag.id, name: tag.name, type: tag.type })));
                    setAlignments((topic.group?.alignments || []).map((alignment) => ({
                      id: alignment.id,
                      framework: alignment.framework || '',
                      standardCode: alignment.standardCode || '',
                      gradeLevel: alignment.gradeLevel || '',
                      description: alignment.description || '',
                    })));
                  } else {
                    reset(defaultValues);
                    setContent(DEFAULT_EDITOR_CONTENT);
                    setTags([]);
                    setAlignments([]);
                  }
                }}
                disabled={saving}
              >
                Reset
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <LucideIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Draft' : 'Create Draft'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
