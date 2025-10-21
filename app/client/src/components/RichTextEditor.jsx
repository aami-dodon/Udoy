import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { EditorContent, useEditor } from '@tiptap/react';

import {
  createEditorExtensions,
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_EDITOR_CONTENT,
  DEFAULT_EDITOR_HTML,
  DEFAULT_PLACEHOLDER,
  RICH_TEXT_EDITOR_TOKENS,
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

const DefaultToolbar = ({ editor = null }) => {
  if (!editor) {
    return null;
  }

  const controls = [
    {
      key: 'bold',
      label: 'B',
      aria: 'Toggle bold',
      isActive: editor.isActive('bold'),
      action: (ed) => ed.chain().focus().toggleBold().run(),
      canRun: editor.can().chain().focus().toggleBold().run(),
    },
    {
      key: 'italic',
      label: 'I',
      aria: 'Toggle italic',
      isActive: editor.isActive('italic'),
      action: (ed) => ed.chain().focus().toggleItalic().run(),
      canRun: editor.can().chain().focus().toggleItalic().run(),
    },
    {
      key: 'bulletList',
      label: '• List',
      aria: 'Toggle bullet list',
      isActive: editor.isActive('bulletList'),
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
      canRun: editor.can().chain().focus().toggleBulletList().run(),
    },
    {
      key: 'orderedList',
      label: '1. List',
      aria: 'Toggle ordered list',
      isActive: editor.isActive('orderedList'),
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
      canRun: editor.can().chain().focus().toggleOrderedList().run(),
    },
    {
      key: 'blockquote',
      label: '“Quote”',
      aria: 'Toggle blockquote',
      isActive: editor.isActive('blockquote'),
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
      canRun: editor.can().chain().focus().toggleBlockquote().run(),
    },
    {
      key: 'undo',
      label: 'Undo',
      aria: 'Undo',
      isActive: false,
      action: (ed) => ed.chain().focus().undo().run(),
      canRun: editor.can().chain().focus().undo().run(),
    },
    {
      key: 'redo',
      label: 'Redo',
      aria: 'Redo',
      isActive: false,
      action: (ed) => ed.chain().focus().redo().run(),
      canRun: editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div className={RICH_TEXT_EDITOR_TOKENS.toolbar}>
      {controls.map((control) => (
        <ToolbarButton
          key={control.key}
          editor={editor}
          ariaLabel={control.aria}
          action={control.action}
          isActive={control.isActive}
          disabled={!control.canRun}
        >
          {control.label}
        </ToolbarButton>
      ))}
    </div>
  );
};

DefaultToolbar.propTypes = {
  editor: PropTypes.object,
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
  const toolbar = typeof renderToolbar === 'function' ? renderToolbar(editor) : <DefaultToolbar editor={editor} />;

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
