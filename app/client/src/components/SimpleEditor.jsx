import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { EditorContent, useEditor } from '@tiptap/react';
import { LucideIcon } from '@icons';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Card,
  CardContent,
} from '@components/ui';

import {
  createEditorExtensions,
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_EDITOR_CONTENT,
  DEFAULT_EDITOR_HTML,
  DEFAULT_PLACEHOLDER,
  RICH_TEXT_EDITOR_TOKENS,
  insertAssetsIntoEditor,
} from '../../../shared/editor/index.js';
import { cn } from '@/lib/utils';

const headingOptions = [
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Heading 1', value: 'heading-1', level: 1 },
  { label: 'Heading 2', value: 'heading-2', level: 2 },
  { label: 'Heading 3', value: 'heading-3', level: 3 },
  { label: 'Heading 4', value: 'heading-4', level: 4 },
];

const listOptions = [
  { label: 'Bullet list', value: 'bulletList' },
  { label: 'Ordered list', value: 'orderedList' },
  { label: 'Task list', value: 'taskList' },
];

const highlightPalette = [
  { label: 'Default', value: '' },
  { label: 'Lemon', value: '#fef08a' },
  { label: 'Sky', value: '#bae6fd' },
  { label: 'Mint', value: '#bbf7d0' },
  { label: 'Lavender', value: '#e9d5ff' },
  { label: 'Rose', value: '#fecdd3' },
  { label: 'Citrus', value: '#fde68a' },
  { label: 'Slate', value: '#e2e8f0' },
];

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

const ToolbarButton = ({
  icon,
  label,
  onClick,
  isActive = false,
  disabled = false,
}) => (
  <Button
    type="button"
    variant={isActive ? 'secondary' : 'ghost'}
    size="sm"
    className={cn(
      'h-9 w-9 p-0 transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    )}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <LucideIcon name={icon} className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </Button>
);

ToolbarButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
};

const ToolbarGroup = ({ children }) => (
  <div className="flex items-center gap-1">{children}</div>
);

ToolbarGroup.propTypes = {
  children: PropTypes.node,
};

const DefaultToolbar = ({
  editor,
  onRequestAssets,
  allowedMimeTypes,
  isUploading,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkHref, setLinkHref] = useState('');
  const uploadInputRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document === 'undefined') {
      return false;
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === 'undefined') {
        setIsMobile(false);
        return;
      }
      setIsMobile(window.innerWidth < 768);
    };

    updateIsMobile();
    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('resize', updateIsMobile);
    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
  }, []);

  useEffect(() => {
    if (!linkOpen || !editor) {
      return;
    }

    const previousUrl = editor.getAttributes('link')?.href || '';
    setLinkHref(previousUrl);
  }, [editor, linkOpen]);

  if (!editor) {
    return null;
  }

  const canInteract = editor.isEditable && !isUploading;

  const currentHeading = headingOptions.find((option) => {
    if (option.value === 'paragraph') {
      return editor.isActive('paragraph') && !editor.isActive('heading');
    }
    if (!option.level) {
      return false;
    }
    return editor.isActive('heading', { level: option.level });
  });

  const headingLabel = currentHeading ? currentHeading.label : 'Paragraph';

  const handleHeadingSelect = (option) => {
    if (!editor) {
      return;
    }

    const chain = editor.chain().focus();
    if (option.value === 'paragraph') {
      chain.setParagraph().run();
      return;
    }

    chain.toggleHeading({ level: option.level }).run();
  };

  const handleListSelect = (option) => {
    if (!editor) {
      return;
    }

    const chain = editor.chain().focus();
    if (option.value === 'bulletList') {
      chain.toggleBulletList().run();
    } else if (option.value === 'orderedList') {
      chain.toggleOrderedList().run();
    } else if (option.value === 'taskList') {
      chain.toggleTaskList().run();
    }
  };

  const triggerUpload = () => {
    if (!canInteract || !uploadInputRef.current) {
      return;
    }

    uploadInputRef.current.value = '';
    uploadInputRef.current.click();
  };

  const handleUploadInputChange = (event) => {
    if (!editor || typeof onRequestAssets !== 'function') {
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    onRequestAssets(files);
    event.target.value = '';
  };

  const applyLink = () => {
    if (!editor) {
      return;
    }

    const url = linkHref.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkOpen(false);
      return;
    }

    const normalized = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: normalized, target: '_blank', rel: 'noopener noreferrer' })
      .run();
    setLinkOpen(false);
  };

  const removeLink = () => {
    if (!editor) {
      return;
    }
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  };

  const toggleTheme = () => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.toggle('dark');
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  };

  const acceptMimeTypes = Array.isArray(allowedMimeTypes) && allowedMimeTypes.length > 0
    ? allowedMimeTypes.join(',')
    : 'image/*,video/*,audio/*,application/pdf';

  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolbarGroup>
        <ToolbarButton
          icon="Undo"
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || !canInteract}
        />
        <ToolbarButton
          icon="Redo"
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || !canInteract}
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <ToolbarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-3"
              disabled={!canInteract}
            >
              <span className="mr-2 text-sm font-semibold">{headingLabel}</span>
              <LucideIcon name="ChevronDown" className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Select heading level</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Headings</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentHeading ? currentHeading.value : 'paragraph'}
              onValueChange={(value) => {
                const option = headingOptions.find((item) => item.value === value);
                if (option) {
                  handleHeadingSelect(option);
                }
              }}
            >
              {headingOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-3"
              disabled={!canInteract}
            >
              <LucideIcon name="ListChecks" className="mr-2 h-4 w-4" aria-hidden="true" />
              Lists
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuLabel>List type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {listOptions.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => handleListSelect(option)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarButton
          icon="Quote"
          label="Toggle blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          disabled={!editor.can().chain().focus().toggleBlockquote().run() || !canInteract}
        />
        <ToolbarButton
          icon="CodeSquare"
          label="Toggle code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run() || !canInteract}
        />
        <ToolbarButton
          icon="SeparatorHorizontal"
          label="Insert horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={!editor.can().chain().focus().setHorizontalRule().run() || !canInteract}
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <ToolbarGroup>
        <ToolbarButton
          icon="Bold"
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run() || !canInteract}
        />
        <ToolbarButton
          icon="Italic"
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run() || !canInteract}
        />
        <ToolbarButton
          icon="Underline"
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          disabled={!editor.can().chain().focus().toggleUnderline().run() || !canInteract}
        />
        <ToolbarButton
          icon="Strikethrough"
          label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          disabled={!editor.can().chain().focus().toggleStrike().run() || !canInteract}
        />
        <ToolbarButton
          icon="Code"
          label="Inline code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          disabled={!editor.can().chain().focus().toggleCode().run() || !canInteract}
        />

        <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
          <PopoverTrigger asChild>
            <ToolbarButton
              icon="Highlighter"
              label="Text highlight"
              onClick={() => setHighlightOpen((prev) => !prev)}
              isActive={editor.isActive('highlight')}
              disabled={!canInteract}
            />
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="flex flex-wrap gap-2">
              {highlightPalette.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  className={cn(
                    'h-8 w-8 rounded-md border border-border transition hover:ring-2 hover:ring-primary focus:outline-none',
                    color.value ? '' : 'bg-background'
                  )}
                  style={color.value ? { backgroundColor: color.value } : undefined}
                  onClick={() => {
                    const chain = editor.chain().focus();
                    if (!color.value) {
                      chain.unsetHighlight().run();
                    } else {
                      chain.setHighlight({ color: color.value }).run();
                    }
                    setHighlightOpen(false);
                  }}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setHighlightOpen(false);
              }}
            >
              Remove highlight
            </Button>
          </PopoverContent>
        </Popover>

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <ToolbarButton
              icon="Link"
              label="Insert link"
              onClick={() => setLinkOpen((prev) => !prev)}
              isActive={editor.isActive('link')}
              disabled={!canInteract}
            />
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editor-link-input">URL</Label>
              <Input
                id="editor-link-input"
                placeholder="https://example.com"
                value={linkHref}
                onChange={(event) => setLinkHref(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" onClick={applyLink}>
                Apply
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={removeLink}
                disabled={!editor.isActive('link')}
              >
                Remove
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <ToolbarGroup>
        <ToolbarButton
          icon="Superscript"
          label="Superscript"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          disabled={!editor.can().chain().focus().toggleSuperscript().run() || !canInteract}
        />
        <ToolbarButton
          icon="Subscript"
          label="Subscript"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          disabled={!editor.can().chain().focus().toggleSubscript().run() || !canInteract}
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <ToolbarGroup>
        <ToolbarButton
          icon="AlignLeft"
          label="Align left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          disabled={!editor.can().chain().focus().setTextAlign('left').run() || !canInteract}
        />
        <ToolbarButton
          icon="AlignCenter"
          label="Align center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          disabled={!editor.can().chain().focus().setTextAlign('center').run() || !canInteract}
        />
        <ToolbarButton
          icon="AlignRight"
          label="Align right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          disabled={!editor.can().chain().focus().setTextAlign('right').run() || !canInteract}
        />
        <ToolbarButton
          icon="AlignJustify"
          label="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          disabled={!editor.can().chain().focus().setTextAlign('justify').run() || !canInteract}
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <ToolbarGroup>
        <ToolbarButton
          icon="Image"
          label="Upload media"
          onClick={triggerUpload}
          disabled={!canInteract}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept={acceptMimeTypes}
          multiple
          className="sr-only"
          onChange={handleUploadInputChange}
        />
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <ToolbarGroup>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-3"
          onClick={toggleTheme}
        >
          <LucideIcon
            name={isDarkMode ? 'Sun' : 'MoonStar'}
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          />
          {isMobile ? '' : isDarkMode ? 'Light mode' : 'Dark mode'}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </ToolbarGroup>
    </div>
  );
};

DefaultToolbar.propTypes = {
  editor: PropTypes.object,
  onRequestAssets: PropTypes.func,
  allowedMimeTypes: PropTypes.arrayOf(PropTypes.string),
  isUploading: PropTypes.bool,
};

const SimpleEditor = ({
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const extensionPreset = useMemo(
    () =>
      createEditorExtensions({
        placeholder,
        onAssetsRequest,
        onAssetsError,
        allowedMimeTypes,
      }),
    [placeholder, onAssetsRequest, onAssetsError, allowedMimeTypes]
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
          class: cn(RICH_TEXT_EDITOR_TOKENS.editor, editorClassName),
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
    [combinedExtensions, readOnly]
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
              .map((type) => (typeof type === 'string' ? type.toLowerCase() : type))
          )
        : null;

      const filteredFiles =
        allowedSet && allowedSet.size > 0
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
          console.error('SimpleEditor asset upload failed', error);
        }
        return;
      }

      const totalFiles = filteredFiles.length;

      const buildProgressState = (update = {}) => {
        const total = update.total ?? totalFiles;
        const completed = update.completed ?? 0;
        const percent = update.percent ?? (total > 0 ? Math.round((completed / total) * 100) : 0);
        const currentFileName = update.currentFileName ?? '';

        return {
          total,
          completed,
          percent,
          currentFileName,
        };
      };

      try {
        setIsUploading(true);
        setUploadProgress(buildProgressState({ total: totalFiles, completed: 0, percent: 0 }));

        const handleProgress = (update = {}) => {
          setUploadProgress((previous) => {
            const baseline = previous || buildProgressState();
            const total = update.total ?? baseline.total ?? totalFiles;
            const completed = update.completed ?? baseline.completed ?? 0;
            const percent = update.percent ?? (total > 0 ? Math.round((completed / total) * 100) : 0);
            const currentFileName =
              update.currentFileName !== undefined ? update.currentFileName : baseline.currentFileName;

            return {
              total,
              completed,
              percent: Math.max(0, Math.min(100, percent)),
              currentFileName,
            };
          });
        };

        const uploads = await onAssetsRequest(filteredFiles, editor, { onProgress: handleProgress });
        if (Array.isArray(uploads) && uploads.length > 0) {
          insertAssetsIntoEditor(editor, uploads);
        }
        setUploadProgress(
          buildProgressState({ total: totalFiles, completed: totalFiles, percent: 100, currentFileName: '' })
        );
      } catch (error) {
        if (typeof onAssetsError === 'function') {
          onAssetsError(error, filteredFiles, editor);
        } else if (typeof console !== 'undefined') {
          console.error('SimpleEditor asset upload failed', error);
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [editor, onAssetsRequest, allowedMimeTypes, onAssetsError]
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const content = ensureContentShape(value, valueFormat);
    if (isEqualContent(editor, content, valueFormat)) {
      return;
    }

    let isCancelled = false;
    const runUpdate = () => {
      if (isCancelled || !editor || editor.isDestroyed) {
        return;
      }
      editor.commands.setContent(content, false);
    };

    if (typeof queueMicrotask === 'function') {
      queueMicrotask(runUpdate);
    } else {
      Promise.resolve().then(runUpdate);
    }

    return () => {
      isCancelled = true;
    };
  }, [editor, value, valueFormat]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  const wrapperClasses = cn(RICH_TEXT_EDITOR_TOKENS.wrapper, 'relative', className);
  const toolbarClasses = cn('px-2', toolbarClassName);

  const toolbar =
    !readOnly && editor
      ? typeof renderToolbar === 'function'
        ? renderToolbar(editor, {
            onAssetsRequest: handleToolbarAssetUpload,
            allowedMimeTypes,
            isUploading,
            uploadProgress,
          })
        : (
            <DefaultToolbar
              editor={editor}
              onRequestAssets={handleToolbarAssetUpload}
              allowedMimeTypes={allowedMimeTypes}
              isUploading={isUploading}
            />
          )
      : null;

  return (
    <div className={wrapperClasses}>
      {!readOnly && toolbar && <div className={toolbarClasses}>{toolbar}</div>}
      <EditorContent editor={editor} />
      {!readOnly && isUploading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur">
          <Card className="w-64 shadow-lg">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <LucideIcon name="Loader2" className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Uploading media…</p>
              {uploadProgress && uploadProgress.total ? (
                <p className="text-xs text-muted-foreground">
                  {uploadProgress.completed}/{uploadProgress.total} uploaded
                  {uploadProgress.percent != null ? ` • ${uploadProgress.percent}%` : ''}
                  {uploadProgress.currentFileName ? ` • ${uploadProgress.currentFileName}` : ''}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

SimpleEditor.propTypes = {
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

export default SimpleEditor;
