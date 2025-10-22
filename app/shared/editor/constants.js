export const DEFAULT_EDITOR_HTML = '<p>Start writing your update…</p>';

export const DEFAULT_EDITOR_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Start writing your update…',
        },
      ],
    },
  ],
};

export const DEFAULT_PLACEHOLDER = 'Write something brilliant…';

export const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const RICH_TEXT_EDITOR_TOKENS = {
  wrapper: 'rich-text-wrapper overflow-hidden rounded-2xl border border-border bg-background shadow-sm',
  toolbar:
    'rich-text-toolbar flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-muted/60',
  editor:
    'rich-text-editor prose prose-slate dark:prose-invert max-w-none min-h-[420px] px-4 py-6 text-base leading-relaxed text-foreground focus:outline-none',
  bubbleMenu:
    'rich-text-bubble flex items-center gap-1 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg backdrop-blur',
  floatingMenu:
    'rich-text-floating-menu flex flex-col gap-1 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg backdrop-blur',
  button:
    'rich-text-button inline-flex h-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  buttonInactive:
    'rich-text-button-inactive bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
  buttonActive:
    'rich-text-button-active bg-primary text-primary-foreground hover:bg-primary/90',
};
