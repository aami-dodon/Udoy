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
  wrapper: 'rich-text-wrapper rounded-xl border border-slate-200 bg-white shadow-sm',
  toolbar: 'rich-text-toolbar flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2',
  editor: 'rich-text-editor prose max-w-none px-3 py-4 text-slate-800 focus:outline-none',
  bubbleMenu: 'rich-text-bubble flex items-center gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg',
  floatingMenu: 'rich-text-floating-menu flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg',
  button: 'rich-text-button inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500',
  buttonActive: 'rich-text-button-active bg-slate-900 text-white hover:bg-slate-800',
};
