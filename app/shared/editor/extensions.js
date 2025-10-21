import { mergeAttributes, Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import FileHandler from '@tiptap/extension-file-handler';
// Ensure underline support is explicitly imported so the toolbar toggle functions in development builds.
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { ReactNodeViewRenderer } from '@tiptap/react';

import {
  DEFAULT_PLACEHOLDER,
  DEFAULT_ALLOWED_MIME_TYPES,
} from './constants.js';
import { ResizableImageNodeView, ResizableVideoNodeView } from './ResizableMediaNodeView.jsx';

const insertFileLink = (editor, asset) => {
  const { href, src, text, attrs = {} } = asset;
  const { label, ...markAttrs } = attrs;
  const url = href || src;
  const linkLabel = text || label || 'Download file';

  editor
    .chain()
    .focus()
    .insertContent({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: linkLabel,
          marks: [
            {
              type: 'link',
              attrs: {
                href: url,
                target: '_blank',
                rel: 'noopener noreferrer',
                class: 'rich-text-file',
                ...markAttrs,
              },
            },
          ],
        },
      ],
    })
    .run();
};

const insertImage = (editor, asset) => {
  const { src, url, alt, attrs = {} } = asset;
  const resolvedSrc = src || url;
  if (!resolvedSrc) {
    return;
  }
  editor
    .chain()
    .focus()
    .setImage({
      src: resolvedSrc,
      alt,
      class: attrs.class || 'rich-text-image rounded-md',
      width: attrs.width || null,
      ...attrs,
    })
    .run();
};

const insertVideo = (editor, asset) => {
  const { src, url, attrs = {} } = asset;
  const resolvedSrc = src || url;
  if (!resolvedSrc) {
    return;
  }

  const videoAttrs = {
    src: resolvedSrc,
    poster: attrs.poster,
    controls: attrs.controls ?? true,
    autoplay: attrs.autoplay ?? false,
    loop: attrs.loop ?? false,
    width: attrs.width || null,
  };

  if (attrs.class) {
    videoAttrs.class = attrs.class;
  } else {
    videoAttrs.class = 'rich-text-video w-full rounded-lg bg-black';
  }

  editor
    .chain()
    .focus()
    .setVideo(videoAttrs)
    .run();
};

const insertAudio = (editor, asset) => {
  const { src, url, attrs = {} } = asset;
  const resolvedSrc = src || url;
  if (!resolvedSrc) {
    return;
  }

  const { class: className, controls, autoplay, loop, ...rest } = attrs;

  editor
    .chain()
    .focus()
    .setAudio({
      src: resolvedSrc,
      controls: controls ?? true,
      autoplay: autoplay ?? false,
      loop: loop ?? false,
      class: className || 'rich-text-audio w-full rounded-md',
      ...rest,
    })
    .run();
};

const assetInserters = {
  image: insertImage,
  video: insertVideo,
  audio: insertAudio,
  file: insertFileLink,
};

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }

          const widthValue =
            typeof attributes.width === 'number' || /^\d+$/.test(String(attributes.width))
              ? `${attributes.width}px`
              : String(attributes.width);

          return {
            'data-width': attributes.width,
            style: `width: ${widthValue}; max-width: 100%; height: auto;`,
          };
        },
        parseHTML: (element) => {
          const widthAttr = element.getAttribute('data-width') || element.getAttribute('width');
          if (!widthAttr) {
            return null;
          }

          const parsed = Number.parseInt(widthAttr, 10);
          return Number.isFinite(parsed) ? parsed : widthAttr;
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

const BaseVideo = Node.create({
  name: 'video',
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      poster: {
        default: null,
      },
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      loop: {
        default: false,
      },
      class: {
        default: 'rich-text-video w-full rounded-lg bg-black',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes({ controls: true }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setVideo:
        (options = {}) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: {
                ...options,
              },
            })
            .run(),
    };
  },
});

export const Video = BaseVideo.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }

          const widthValue =
            typeof attributes.width === 'number' || /^\d+$/.test(String(attributes.width))
              ? `${attributes.width}px`
              : String(attributes.width);

          return {
            'data-width': attributes.width,
            style: `width: ${widthValue}; max-width: 100%; height: auto;`,
          };
        },
        parseHTML: (element) => {
          const widthAttr = element.getAttribute('data-width') || element.getAttribute('width');
          if (!widthAttr) {
            return null;
          }

          const parsed = Number.parseInt(widthAttr, 10);
          return Number.isFinite(parsed) ? parsed : widthAttr;
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableVideoNodeView);
  },
});

export const Audio = Node.create({
  name: 'audio',
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      loop: {
        default: false,
      },
      class: {
        default: 'rich-text-audio w-full rounded-md',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes({ controls: true }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setAudio:
        (options = {}) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: {
                ...options,
              },
            })
            .run(),
    };
  },
});

export const insertAssetsIntoEditor = (editor, assets = []) => {
  if (!editor || !Array.isArray(assets)) {
    return;
  }

  assets.forEach((asset) => {
    if (!asset) {
      return;
    }

    const typeKey = typeof asset.type === 'string' ? asset.type.toLowerCase() : 'file';
    const handler = assetInserters[typeKey] || insertFileLink;
    handler(editor, asset);
  });
};

export const createEditorExtensions = ({
  placeholder = DEFAULT_PLACEHOLDER,
  onAssetsRequest,
  onAssetsError,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
} = {}) => {
  const extensions = [
    StarterKit.configure({
      history: {
        depth: 100,
      },
      heading: {
        levels: [1, 2, 3, 4],
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: 'rich-text-link text-brand-600 underline underline-offset-2 hover:text-brand-700',
      },
    }),
    ResizableImage.configure({
      inline: false,
      HTMLAttributes: {
        class: 'rich-text-image rounded-md',
      },
    }),
    Video,
    Audio,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ];

  if (placeholder) {
    extensions.push(
      Placeholder.configure({
        placeholder,
        showOnlyCurrent: false,
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
    );
  }

  if (typeof onAssetsRequest === 'function') {
    const handleFiles = async (files, editor) => {
      const fileList = Array.from(files);
      if (!fileList.length) {
        return;
      }

      try {
        const uploads = await onAssetsRequest(fileList, editor);
        insertAssetsIntoEditor(editor, uploads);
      } catch (error) {
        if (typeof onAssetsError === 'function') {
          onAssetsError(error, fileList, editor);
        } else if (typeof console !== 'undefined') {
          console.error('RichTextEditor asset upload failed', error);
        }
      }
    };

    extensions.push(
      FileHandler.configure({
        allowedMimeTypes,
        onDrop: handleFiles,
        onPaste: handleFiles,
      }),
    );
  }

  return extensions;
};
