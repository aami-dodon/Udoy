import { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { EditorContent, useEditor } from '@tiptap/react';
import { LucideIcon } from '@icons';

import {
  createEditorExtensions,
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_EDITOR_CONTENT,
  DEFAULT_EDITOR_HTML,
  DEFAULT_PLACEHOLDER,
  RICH_TEXT_EDITOR_TOKENS,
  insertAssetsIntoEditor,
} from '../../../shared/editor/index.js';

const buttonClassName = (isActive) => {
  const base = RICH_TEXT_EDITOR_TOKENS.button;
  if (isActive) {
    return `${base} ${RICH_TEXT_EDITOR_TOKENS.buttonActive}`.trim();
  }

  return base;
};

const ToolbarButton = ({ editor, action, isActive = false, children, ariaLabel, disabled = false }) => (
  <button
    type="button"
    onClick={() => action(editor)}
    aria-label={ariaLabel}
    title={ariaLabel}
    className={buttonClassName(isActive)}
    disabled={disabled}
  >
    {children}
  </button>
);

ToolbarButton.propTypes = {
  editor: PropTypes.object.isRequired,
  action: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  children: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

const ToolbarDivider = () => <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />;

const ToolbarUploadButton = ({
  iconName,
  ariaLabel,
  onSelectFiles,
  accept,
  multiple = true,
  disabled = false,
}) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (disabled || !inputRef.current) {
      return;
    }

    inputRef.current.value = '';
    inputRef.current.click();
  };

  const handleChange = (event) => {
    if (disabled) {
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length > 0 && typeof onSelectFiles === 'function') {
      onSelectFiles(files);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={buttonClassName(false)}
        disabled={disabled}
      >
        <LucideIcon name={iconName} className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
      />
    </>
  );
};

ToolbarUploadButton.propTypes = {
  iconName: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  onSelectFiles: PropTypes.func,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
};

const DefaultToolbar = ({ editor = null, onRequestAssets, allowedMimeTypes = [] }) => {
  if (!editor) {
    return null;
  }

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const promptImpl = typeof window !== 'undefined' && typeof window.prompt === 'function' ? window.prompt : null;
    const input = promptImpl ? promptImpl('Enter URL', previousUrl) : previousUrl;

    if (input === null) {
      return;
    }

    const trimmed = input.trim();
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const normalized = /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: normalized, target: '_blank', rel: 'noopener noreferrer' })
      .run();
  };

  const handleUnsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const toolbarItems = [
    {
      type: 'button',
      key: 'paragraph',
      icon: 'Pilcrow',
      aria: 'Paragraph',
      isActive: editor.isActive('paragraph'),
      action: (ed) => ed.chain().focus().setParagraph().run(),
      canRun: editor.can().chain().focus().setParagraph().run(),
    },
    {
      type: 'button',
      key: 'heading-1',
      icon: 'Heading1',
      aria: 'Heading level 1',
      isActive: editor.isActive('heading', { level: 1 }),
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
      canRun: editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      type: 'button',
      key: 'heading-2',
      icon: 'Heading2',
      aria: 'Heading level 2',
      isActive: editor.isActive('heading', { level: 2 }),
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
      canRun: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      type: 'button',
      key: 'heading-3',
      icon: 'Heading3',
      aria: 'Heading level 3',
      isActive: editor.isActive('heading', { level: 3 }),
      action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
      canRun: editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      type: 'button',
      key: 'heading-4',
      icon: 'Heading4',
      aria: 'Heading level 4',
      isActive: editor.isActive('heading', { level: 4 }),
      action: (ed) => ed.chain().focus().toggleHeading({ level: 4 }).run(),
      canRun: editor.can().chain().focus().toggleHeading({ level: 4 }).run(),
    },
    { type: 'divider', key: 'divider-structure' },
    {
      type: 'button',
      key: 'bold',
      icon: 'Bold',
      aria: 'Toggle bold',
      isActive: editor.isActive('bold'),
      action: (ed) => ed.chain().focus().toggleBold().run(),
      canRun: editor.can().chain().focus().toggleBold().run(),
    },
    {
      type: 'button',
      key: 'italic',
      icon: 'Italic',
      aria: 'Toggle italic',
      isActive: editor.isActive('italic'),
      action: (ed) => ed.chain().focus().toggleItalic().run(),
      canRun: editor.can().chain().focus().toggleItalic().run(),
    },
    {
      type: 'button',
      key: 'underline',
      icon: 'Underline',
      aria: 'Toggle underline',
      isActive: editor.isActive('underline'),
      action: (ed) => ed.chain().focus().toggleUnderline().run(),
      canRun: editor.can().chain().focus().toggleUnderline().run(),
    },
    {
      type: 'button',
      key: 'strike',
      icon: 'Strikethrough',
      aria: 'Toggle strikethrough',
      isActive: editor.isActive('strike'),
      action: (ed) => ed.chain().focus().toggleStrike().run(),
      canRun: editor.can().chain().focus().toggleStrike().run(),
    },
    {
      type: 'button',
      key: 'code',
      icon: 'Code',
      aria: 'Toggle code',
      isActive: editor.isActive('code'),
      action: (ed) => ed.chain().focus().toggleCode().run(),
      canRun: editor.can().chain().focus().toggleCode().run(),
    },
    {
      type: 'button',
      key: 'clear-formatting',
      icon: 'RemoveFormatting',
      aria: 'Clear formatting',
      isActive: false,
      action: (ed) => {
        const chain = ed.chain().focus();
        chain.unsetAllMarks();
        chain.clearNodes();
        chain.run();
      },
      canRun: editor.can().chain().focus().unsetAllMarks().run(),
    },
    { type: 'divider', key: 'divider-alignment' },
    {
      type: 'button',
      key: 'align-left',
      icon: 'AlignLeft',
      aria: 'Align left',
      isActive: editor.isActive({ textAlign: 'left' }) || editor.isActive('paragraph', { textAlign: 'left' }),
      action: (ed) => ed.chain().focus().setTextAlign('left').run(),
      canRun: editor.can().chain().focus().setTextAlign('left').run(),
    },
    {
      type: 'button',
      key: 'align-center',
      icon: 'AlignCenter',
      aria: 'Align center',
      isActive: editor.isActive({ textAlign: 'center' }),
      action: (ed) => ed.chain().focus().setTextAlign('center').run(),
      canRun: editor.can().chain().focus().setTextAlign('center').run(),
    },
    {
      type: 'button',
      key: 'align-right',
      icon: 'AlignRight',
      aria: 'Align right',
      isActive: editor.isActive({ textAlign: 'right' }),
      action: (ed) => ed.chain().focus().setTextAlign('right').run(),
      canRun: editor.can().chain().focus().setTextAlign('right').run(),
    },
    { type: 'divider', key: 'divider-lists' },
    {
      type: 'button',
      key: 'bullet-list',
      icon: 'List',
      aria: 'Toggle bullet list',
      isActive: editor.isActive('bulletList'),
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
      canRun: editor.can().chain().focus().toggleBulletList().run(),
    },
    {
      type: 'button',
      key: 'ordered-list',
      icon: 'ListOrdered',
      aria: 'Toggle ordered list',
      isActive: editor.isActive('orderedList'),
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
      canRun: editor.can().chain().focus().toggleOrderedList().run(),
    },
    {
      type: 'button',
      key: 'blockquote',
      icon: 'Quote',
      aria: 'Toggle blockquote',
      isActive: editor.isActive('blockquote'),
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
      canRun: editor.can().chain().focus().toggleBlockquote().run(),
    },
    {
      type: 'button',
      key: 'code-block',
      icon: 'CodeSquare',
      aria: 'Toggle code block',
      isActive: editor.isActive('codeBlock'),
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      canRun: editor.can().chain().focus().toggleCodeBlock().run(),
    },
    {
      type: 'button',
      key: 'horizontal-rule',
      icon: 'SeparatorHorizontal',
      aria: 'Insert horizontal rule',
      isActive: false,
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
      canRun: editor.can().chain().focus().setHorizontalRule().run(),
    },
    { type: 'divider', key: 'divider-links' },
    {
      type: 'button',
      key: 'link',
      icon: 'Link',
      aria: 'Insert link',
      isActive: editor.isActive('link'),
      action: handleSetLink,
      canRun: true,
    },
    {
      type: 'button',
      key: 'unlink',
      icon: 'Unlink',
      aria: 'Remove link',
      isActive: false,
      action: handleUnsetLink,
      canRun: editor.can().chain().focus().extendMarkRange('link').unsetLink().run(),
    },
    { type: 'divider', key: 'divider-media' },
    {
      type: 'upload',
      key: 'upload-image',
      icon: 'Image',
      aria: 'Upload image',
      accept: 'image/*',
    },
    {
      type: 'upload',
      key: 'upload-video',
      icon: 'Video',
      aria: 'Upload video',
      accept: 'video/*',
    },
    {
      type: 'upload',
      key: 'upload-audio',
      icon: 'AudioLines',
      aria: 'Upload audio',
      accept: 'audio/*',
    },
    {
      type: 'upload',
      key: 'upload-file',
      icon: 'Paperclip',
      aria: 'Upload attachment',
      accept: Array.isArray(allowedMimeTypes) && allowedMimeTypes.length > 0 ? allowedMimeTypes.join(',') : undefined,
    },
    { type: 'divider', key: 'divider-history' },
    {
      type: 'button',
      key: 'undo',
      icon: 'Undo',
      aria: 'Undo',
      isActive: false,
      action: (ed) => ed.chain().focus().undo().run(),
      canRun: editor.can().chain().focus().undo().run(),
    },
    {
      type: 'button',
      key: 'redo',
      icon: 'Redo',
      aria: 'Redo',
      isActive: false,
      action: (ed) => ed.chain().focus().redo().run(),
      canRun: editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div className={RICH_TEXT_EDITOR_TOKENS.toolbar}>
      {toolbarItems.map((item) => {
        if (item.type === 'divider') {
          return <ToolbarDivider key={item.key} />;
        }

        if (item.type === 'upload') {
          if (typeof onRequestAssets !== 'function') {
            return null;
          }

          return (
            <ToolbarUploadButton
              key={item.key}
              iconName={item.icon}
              ariaLabel={item.aria}
              accept={item.accept}
              onSelectFiles={onRequestAssets}
              disabled={!editor.isEditable}
            />
          );
        }

        return (
          <ToolbarButton
            key={item.key}
            editor={editor}
            ariaLabel={item.aria}
            action={item.action}
            isActive={item.isActive}
            disabled={!item.canRun || !editor.isEditable}
          >
            <LucideIcon name={item.icon} className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
        );
      })}
    </div>
  );
};

DefaultToolbar.propTypes = {
  editor: PropTypes.object,
  onRequestAssets: PropTypes.func,
  allowedMimeTypes: PropTypes.arrayOf(PropTypes.string),
};

const ensureContentShape = (value, format) => {
  if (value == null) {
    return format === 'json' ? DEFAULT_EDITOR_CONTENT : DEFAULT_EDITOR_HTML;
  }

  return value;
};

const isEqualContent = (editor, value, format) => {
  if (!editor) {
    return true;
  }

  if (format === 'json') {
    try {
      const current = editor.getJSON();
      return JSON.stringify(current) === JSON.stringify(value);
    } catch (error) {
      return false;
    }
  }

  return editor.getHTML() === value;
};

const RichTextEditor = ({
  value,
  onChange,
  onReady,
  valueFormat = 'html',
  placeholder = DEFAULT_PLACEHOLDER,
  readOnly = false,
  className = '',
  editorClassName = '',
  toolbarClassName = '',
  onAssetsRequest,
  onAssetsError,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  additionalExtensions,
  renderToolbar,
  editorProps,
}) => {
  const extensionPreset = useMemo(
    () =>
      createEditorExtensions({
        placeholder,
        onAssetsRequest,
        onAssetsError,
        allowedMimeTypes,
      }),
    [placeholder, onAssetsRequest, onAssetsError, allowedMimeTypes],
  );

  const combinedExtensions = useMemo(() => {
    if (!additionalExtensions || additionalExtensions.length === 0) {
      return extensionPreset;
    }

    return [...extensionPreset, ...additionalExtensions];
  }, [extensionPreset, additionalExtensions]);

  const editor = useEditor(
    {
      extensions: combinedExtensions,
      content: ensureContentShape(value, valueFormat),
      editable: !readOnly,
      editorProps: {
        attributes: {
          class: `${RICH_TEXT_EDITOR_TOKENS.editor}${editorClassName ? ` ${editorClassName}` : ''}`,
        },
        ...editorProps,
      },
      onCreate: ({ editor: editorInstance }) => {
        if (typeof onReady === 'function') {
          onReady(editorInstance);
        }
      },
      onUpdate: ({ editor: editorInstance }) => {
        if (typeof onChange !== 'function') {
          return;
        }

        const payload = {
          html: editorInstance.getHTML(),
          json: editorInstance.getJSON(),
          text: editorInstance.getText(),
        };

        onChange(valueFormat === 'json' ? payload.json : payload.html, payload);
      },
    },
    [combinedExtensions, readOnly],
  );

  const handleToolbarAssetUpload = useCallback(
    async (files) => {
      if (!editor || typeof onAssetsRequest !== 'function') {
        return;
      }

      const candidateFiles = Array.isArray(files) ? files : Array.from(files || []);
      if (!candidateFiles.length) {
        return;
      }

      const allowedSet = Array.isArray(allowedMimeTypes)
        ? new Set(
            allowedMimeTypes
              .filter(Boolean)
              .map((type) => (typeof type === 'string' ? type.toLowerCase() : type)),
          )
        : null;

      const filteredFiles = allowedSet && allowedSet.size > 0
        ? candidateFiles.filter((file) => {
            if (!file.type) {
              return true;
            }
            return allowedSet.has(file.type.toLowerCase());
          })
        : candidateFiles;

      if (!filteredFiles.length) {
        const error = new Error('Selected files are not supported for uploads.');
        if (typeof onAssetsError === 'function') {
          onAssetsError(error, candidateFiles, editor);
        } else if (typeof console !== 'undefined') {
          console.error('RichTextEditor asset upload failed', error);
        }
        return;
      }

      try {
        const uploads = await onAssetsRequest(filteredFiles, editor);
        if (Array.isArray(uploads) && uploads.length > 0) {
          insertAssetsIntoEditor(editor, uploads);
        }
      } catch (error) {
        if (typeof onAssetsError === 'function') {
          onAssetsError(error, filteredFiles, editor);
        } else if (typeof console !== 'undefined') {
          console.error('RichTextEditor asset upload failed', error);
        }
      }
    },
    [editor, onAssetsRequest, allowedMimeTypes, onAssetsError],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.isDestroyed) {
      return;
    }

    const content = ensureContentShape(value, valueFormat);
    if (!isEqualContent(editor, content, valueFormat)) {
      editor.commands.setContent(content, false);
    }
  }, [editor, value, valueFormat]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  const wrapperClasses = `${RICH_TEXT_EDITOR_TOKENS.wrapper}${className ? ` ${className}` : ''}`;
  const toolbarClasses = `${toolbarClassName || ''}`.trim();
  const toolbar =
    typeof renderToolbar === 'function'
      ? renderToolbar(editor, { onAssetsRequest: handleToolbarAssetUpload, allowedMimeTypes })
      : (
          <DefaultToolbar
            editor={editor}
            onRequestAssets={handleToolbarAssetUpload}
            allowedMimeTypes={allowedMimeTypes}
          />
        );

  return (
    <div className={wrapperClasses}>
      {!readOnly && editor && toolbar && (
        <div className={toolbarClasses}>{toolbar}</div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  onReady: PropTypes.func,
  valueFormat: PropTypes.oneOf(['html', 'json']),
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  editorClassName: PropTypes.string,
  toolbarClassName: PropTypes.string,
  onAssetsRequest: PropTypes.func,
  onAssetsError: PropTypes.func,
  allowedMimeTypes: PropTypes.arrayOf(PropTypes.string),
  additionalExtensions: PropTypes.array,
  renderToolbar: PropTypes.func,
  editorProps: PropTypes.object,
};

export default RichTextEditor;
