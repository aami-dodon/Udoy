# Shared Rich Text Editor

This folder centralises the configuration used by every Udoy app when rendering Tiptap.  It exposes extension presets, default content, styling tokens, and documentation so that feature teams can drop the editor into any view without rebuilding the wiring each time.

## What lives here?

- `constants.js` — shared defaults (placeholder copy, default document content, styling utility classes, and allowed upload MIME types).
- `extensions.js` — factory that returns the default set of Tiptap extensions (StarterKit, Placeholder, Link, Image, HTML5 Video, FileHandler) with Udoy’s conventions baked in. The raw `Video` node is also exported should you need to compose custom presets.
- `index.js` — barrel export for convenience.
- `README.md` — you are reading it.

## Styling tokens

`RICH_TEXT_EDITOR_TOKENS` contains Tailwind utility strings that are consumed by the client component.

| Token | Description | Classes |
| --- | --- | --- |
| `wrapper` | Outer container applied around the editor and toolbar. | `rich-text-wrapper rounded-xl border border-slate-200 bg-white shadow-sm` |
| `toolbar` | Default toolbar layout. | `rich-text-toolbar flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2` |
| `editor` | Applied to the editable surface. | `rich-text-editor prose max-w-none px-3 py-4 text-slate-800 focus:outline-none` |
| `bubbleMenu` | (Optional) bubble menu surface. | `rich-text-bubble flex items-center gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg` |
| `floatingMenu` | (Optional) floating menu palette. | `rich-text-floating-menu flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg` |
| `button` | Toolbar button base styles. | `rich-text-button inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500` |
| `buttonActive` | Applied to active toolbar buttons. | `rich-text-button-active bg-slate-900 text-white hover:bg-slate-800` |

Because these are regular class strings you can either use them directly or merge them with view-specific classes when composing UI.

## Extension preset

```js
import { createEditorExtensions } from 'app/shared/editor';

const extensions = createEditorExtensions({
  placeholder: 'Tell your story…',
  onAssetsRequest: async (files, editor) => {
    // Upload logic returning an array of asset descriptors
  },
});
```

The preset wires up:

- `StarterKit` with headings (`h1–h4`), history depth of 100, and list defaults.
- `Placeholder` with the supplied copy.
- `Link` configured for safe external links.
- `Image` with standardised Tailwind classes.
- `Video` — a bespoke HTML5 video node designed for MinIO-backed uploads (renders a `<video>` element with Udoy styling).
- `FileHandler` to capture drop/paste events and delegate uploads to your callback.

### Asset upload callback contract

`onAssetsRequest(files, editor)` should return a `Promise` that resolves with an array of asset descriptors:

```ts
interface UploadedAsset {
  type: 'image' | 'video' | 'file';
  src: string; // The CDN/MinIO URL for the asset
  alt?: string; // Optional alt text (images)
  text?: string; // Optional link text (files)
  href?: string; // Override URL for files if different to src
  attrs?: Record<string, any>; // Extra attributes forwarded to the node/mark
}
```

Use `onAssetsError?(error, files, editor)` to surface upload failures (e.g. toast, logger).  Allowed MIME types can be overridden via the `allowedMimeTypes` argument—by default we accept common images, MP4/QuickTime/WebM video, and PDF/Doc files.

The helper will automatically insert the correct node/mark:

- `image` → `<img>` node with Udoy styling.
- `video` → HTML5 `<video>` node with controls enabled by default.
- `file` or unknown types → fallback link inserted into the document.

## Default content

- `DEFAULT_EDITOR_CONTENT` — ProseMirror JSON representing a single paragraph with helper text.
- `DEFAULT_EDITOR_HTML` — HTML string equivalent of the same paragraph.
- `DEFAULT_PLACEHOLDER` — Copy used when the document is empty.

Use whichever format matches your persistence strategy.

## Client usage (`RichTextEditor` component)

The reusable client wrapper lives in `app/client/src/components/RichTextEditor.jsx` and already imports everything above.  Drop it into any form:

```jsx
import { useState, useCallback } from 'react';
import RichTextEditor from '../components/RichTextEditor.jsx';

const Example = () => {
  const [content, setContent] = useState('');

  const handleUpload = useCallback(async (files) => {
    // 1. Ask the server for pre-signed URLs
    // 2. Upload to MinIO
    // 3. Return asset descriptors for insertion
    return files.map((file) => ({
      type: file.type.startsWith('image/') ? 'image' : 'file',
      src: await uploadToStorage(file),
      alt: file.name,
    }));
  }, []);

  return (
    <RichTextEditor
      value={content}
      onChange={(nextValue, payload) => {
        setContent(nextValue); // HTML because `valueFormat` defaults to "html"
        // payload.json / payload.text are also available if needed
      }}
      onAssetsRequest={handleUpload}
    />
  );
};
```

### Required CSS

The component relies on the Tailwind classes exposed via `RICH_TEXT_EDITOR_TOKENS`.  Ensure your application pulls in the shared Tailwind preset (`app/shared/theme/tailwind.preset.js`) so these utility classes resolve correctly.  No additional manual CSS is required beyond Tailwind.

### Props overview

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string \| object` | `DEFAULT_EDITOR_HTML` (HTML) | Provide HTML or ProseMirror JSON depending on `valueFormat`. |
| `valueFormat` | `'html' \| 'json'` | `'html'` | Determines the format passed to `value` and `onChange`. |
| `onChange` | `(value, payload) => void` | — | Invoked on every document update. `payload` includes `{ html, json, text }`. |
| `onReady` | `(editor) => void` | — | Called once the editor instance is created. |
| `placeholder` | `string` | `DEFAULT_PLACEHOLDER` | Overrides placeholder copy. |
| `readOnly` | `boolean` | `false` | Locks the editor. |
| `onAssetsRequest` | `(files, editor) => Promise<UploadedAsset[]>` | — | Hook for handling uploads. |
| `onAssetsError` | `(error, files, editor) => void` | logs to console | Optional error handler when uploads fail. |
| `allowedMimeTypes` | `string[]` | `DEFAULT_ALLOWED_MIME_TYPES` | Filter drop/paste events. |
| `additionalExtensions` | `Extension[]` | — | Append extra Tiptap extensions when needed. |
| `renderToolbar` | `(editor) => ReactNode` | default toolbar | Supply a custom toolbar renderer. |
| `className`, `editorClassName`, `toolbarClassName` | `string` | `''` | Tailwind class overrides. |
| `editorProps` | `object` | `{}` | Forwarded to Tiptap’s `editorProps`. |

With this setup any feature team can render a production-ready rich text experience by importing the component and optional helper functions, while keeping upload logic bespoke to their feature.
