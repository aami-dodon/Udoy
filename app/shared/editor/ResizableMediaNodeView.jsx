import { NodeViewWrapper } from '@tiptap/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LucideIcon } from '../icons/index.js';

const MIN_MEDIA_WIDTH = 160;
const MAX_MEDIA_WIDTH = 1400;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatWidth = (width) => {
  if (!width) {
    return undefined;
  }

  if (typeof width === 'number') {
    return `${width}px`;
  }

  const parsed = Number.parseInt(width, 10);
  return Number.isFinite(parsed) ? `${parsed}px` : width;
};

function useResizeHandler({ updateAttributes, getCurrentWidth, getParentWidth, enabled }) {
  const cleanupRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(
    () => () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    },
    [],
  );

  const startResize = useCallback(
    (event) => {
      if (!enabled) {
        return;
      }

      if (event.button && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = getCurrentWidth();
      const parentWidth = getParentWidth();
      if (!startWidth) {
        return;
      }

      const maxWidth = parentWidth ? Math.min(parentWidth, MAX_MEDIA_WIDTH) : MAX_MEDIA_WIDTH;

      setIsResizing(true);

      const handlePointerMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const nextWidth = clamp(Math.round(startWidth + deltaX), MIN_MEDIA_WIDTH, maxWidth);
        updateAttributes({ width: nextWidth });
      };

      const handlePointerUp = () => {
        setIsResizing(false);
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp, { once: true });

      cleanupRef.current = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    },
    [enabled, getCurrentWidth, getParentWidth, updateAttributes],
  );

  return { isResizing, startResize };
}

function ResizableMediaNodeView({ node, editor, updateAttributes, deleteNode, selected, as = 'img' }) {
  const wrapperRef = useRef(null);
  const mediaRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const mediaAttrs = node.attrs || {};
  const editable = editor?.isEditable;

  const getCurrentWidth = useCallback(() => {
    if (!mediaRef.current) {
      return null;
    }

    const rect = mediaRef.current.getBoundingClientRect();
    if (!rect.width) {
      return null;
    }

    return rect.width;
  }, []);

  const getParentWidth = useCallback(() => {
    if (!wrapperRef.current) {
      return null;
    }

    const parent = wrapperRef.current.parentElement;
    if (!parent) {
      return null;
    }

    const rect = parent.getBoundingClientRect();
    return rect.width || null;
  }, []);

  const { isResizing, startResize } = useResizeHandler({
    updateAttributes,
    getCurrentWidth,
    getParentWidth,
    enabled: editable,
  });

  const handleRemove = useCallback(() => {
    if (typeof deleteNode === 'function') {
      deleteNode();
    }
  }, [deleteNode]);

  const handleResetSize = useCallback(() => {
    updateAttributes({ width: null });
  }, [updateAttributes]);

  const widthStyle = useMemo(() => formatWidth(mediaAttrs.width), [mediaAttrs.width]);

  const commonMediaClasses = useMemo(
    () =>
      clsx(
        as === 'video'
          ? 'rich-text-video h-auto max-h-[720px] w-full rounded-lg bg-black object-contain'
          : 'rich-text-image h-auto max-h-full w-full rounded-lg object-contain',
        mediaAttrs.class,
      ),
    [as, mediaAttrs.class],
  );

  const showControls = editable && (isHovering || selected || isResizing);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className="not-prose my-6 flex w-full justify-center"
      data-selected={selected ? 'true' : undefined}
      data-resizing={isResizing ? 'true' : undefined}
    >
      <figure
        className={clsx(
          'group relative inline-flex max-w-full flex-col items-center',
          selected || isResizing ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white' : 'ring-0',
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {as === 'video' ? (
          <video
            ref={mediaRef}
            src={mediaAttrs.src}
            poster={mediaAttrs.poster || undefined}
            controls={mediaAttrs.controls !== false}
            autoPlay={mediaAttrs.autoplay || false}
            loop={mediaAttrs.loop || false}
            playsInline
            className={commonMediaClasses}
            style={{ width: widthStyle }}
          />
        ) : (
          <img
            ref={mediaRef}
            src={mediaAttrs.src}
            alt={mediaAttrs.alt || ''}
            className={commonMediaClasses}
            style={{ width: widthStyle }}
            draggable={false}
          />
        )}

        {editable && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end gap-2 p-3">
            <div
              className={clsx(
                'flex flex-col items-end gap-2 transition-opacity duration-150',
                showControls ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <button
                type="button"
                onClick={handleResetSize}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Reset media width"
              >
                <LucideIcon name="Expand" size="sm" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={`Remove ${as === 'video' ? 'video' : 'image'}`}
              >
                <LucideIcon name="Trash2" size="sm" />
              </button>
            </div>
          </div>
        )}

        {editable && (
          <button
            type="button"
            onPointerDown={startResize}
            className={clsx(
              'absolute bottom-0 right-0 flex h-6 w-6 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition',
              isResizing ? 'cursor-grabbing bg-slate-100' : 'cursor-se-resize hover:bg-slate-100',
            )}
            aria-label="Resize media"
          >
            <LucideIcon name="MoveDiagonal" size="sm" />
          </button>
        )}
      </figure>
    </NodeViewWrapper>
  );
}

ResizableMediaNodeView.propTypes = {
  node: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired,
  updateAttributes: PropTypes.func.isRequired,
  deleteNode: PropTypes.func,
  selected: PropTypes.bool,
  as: PropTypes.oneOf(['img', 'video']),
};

export function ResizableImageNodeView(props) {
  return <ResizableMediaNodeView {...props} as="img" />;
}

export function ResizableVideoNodeView(props) {
  return <ResizableMediaNodeView {...props} as="video" />;
}

ResizableImageNodeView.propTypes = ResizableMediaNodeView.propTypes;
ResizableVideoNodeView.propTypes = ResizableMediaNodeView.propTypes;

export default ResizableMediaNodeView;
