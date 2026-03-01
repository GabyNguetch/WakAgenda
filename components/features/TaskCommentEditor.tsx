'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewRendererProps } from '@tiptap/core';
import { Badge, LoadingSpinner } from '@/components/ui/Index';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/apiClient';
import { useGetComment, useSubmitComment } from '@/hooks/useTaskComment';
import { CATEGORY_COLORS, STATUS_COLORS, DOMAIN_COLORS, formatDate, formatTime } from '@/lib/utils';
import type { TaskResponse } from '@/types';
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, List, ListOrdered, Code, ImageIcon,
} from 'lucide-react';

// ─── Pure DOM NodeView for resizable/alignable images ───────────────────────
// We avoid ReactNodeViewRenderer (causes flushSync crash in React 19).
// Everything is plain DOM manipulation inside TipTap's NodeView API.

const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: '' },
      width: { default: 300 },
      align: { default: 'left' },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-rimg]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, width, align } = HTMLAttributes;
    return [
      'figure',
      mergeAttributes({ 'data-rimg': '1', style: `text-align:${align ?? 'left'}` }),
      ['img', { src, alt: alt ?? '', width: width ?? 300, style: 'max-width:100%;height:auto;display:inline-block;border-radius:4px' }],
    ];
  },

  addNodeView() {
    return (props: NodeViewRendererProps) => {
      const { node, getPos, editor } = props;

      const getAttr = () => ({
        src:   node.attrs.src   as string,
        alt:   node.attrs.alt   as string,
        width: (node.attrs.width as number) ?? 300,
        align: (node.attrs.align as string) ?? 'left',
      });

      // ── Outer wrapper ──────────────────────────────────────────────────────
      const wrapper = document.createElement('figure');
      wrapper.setAttribute('data-rimg', '1');
      wrapper.style.cssText = 'margin:8px 0;display:block;position:relative;user-select:none;';

      // ── Floating toolbar (alignment) ───────────────────────────────────────
      const toolbar = document.createElement('div');
      toolbar.style.cssText = [
        'position:absolute;top:-36px;left:0;display:none;',
        'background:#fff;border:1px solid #e5e7eb;border-radius:8px;',
        'padding:3px 6px;gap:4px;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,.1);z-index:50;',
      ].join('');

      const ALIGNS = [
        { value: 'left',   label: '←', title: 'Aligner à gauche' },
        { value: 'center', label: '↔', title: 'Centrer' },
        { value: 'right',  label: '→', title: 'Aligner à droite' },
      ];

      const sizeLabel = document.createElement('span');
      sizeLabel.style.cssText = 'font-size:11px;color:#9ca3af;font-family:monospace;padding-left:4px;';

      const alignBtns: HTMLButtonElement[] = [];

      ALIGNS.forEach(({ value, label, title }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.title = title;
        btn.dataset.align = value;
        btn.style.cssText = 'width:24px;height:24px;border-radius:5px;border:none;cursor:pointer;font-size:13px;transition:background .15s;';
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const pos = typeof getPos === 'function' ? getPos() : null;
          if (pos == null) return;
          editor.chain().setNodeSelection(pos).updateAttributes('resizableImage', { align: value }).run();
        });
        toolbar.appendChild(btn);
        alignBtns.push(btn);
      });

      toolbar.appendChild(sizeLabel);
      wrapper.appendChild(toolbar);

      // ── Image container ────────────────────────────────────────────────────
      const imgWrap = document.createElement('div');
      imgWrap.style.cssText = 'display:inline-block;position:relative;';

      const img = document.createElement('img');
      img.style.cssText = 'display:block;height:auto;border-radius:4px;max-width:100%;';
      imgWrap.appendChild(img);

      // ── Resize handle ──────────────────────────────────────────────────────
      const handle = document.createElement('div');
      handle.style.cssText = [
        'position:absolute;bottom:0;right:0;width:18px;height:18px;',
        'background:#C8102E;border-radius:4px 0 0 0;cursor:se-resize;',
        'display:none;align-items:center;justify-content:center;z-index:20;',
      ].join('');
      handle.innerHTML = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 7.5L7.5 1.5M4.5 7.5L7.5 4.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`;

      let isResizing = false;
      let startX = 0;
      let startW = 0;

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startW = getAttr().width;

        const onMove = (ev: MouseEvent) => {
          if (!isResizing) return;
          const next = Math.max(80, Math.min(900, startW + ev.clientX - startX));
          const rounded = Math.round(next);
          img.style.width = `${rounded}px`;
          imgWrap.style.width = `${rounded}px`;
          sizeLabel.textContent = `${rounded}px`;
        };
        const onUp = (ev: MouseEvent) => {
          isResizing = false;
          const rounded = Math.max(80, Math.min(900, Math.round(startW + ev.clientX - startX)));
          const pos = typeof getPos === 'function' ? getPos() : null;
          if (pos != null) {
            editor.chain().setNodeSelection(pos).updateAttributes('resizableImage', { width: rounded }).run();
          }
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });

      imgWrap.appendChild(handle);
      wrapper.appendChild(imgWrap);

      // ── Sync DOM from node attrs ───────────────────────────────────────────
      const syncAttrs = (attrs: ReturnType<typeof getAttr>) => {
        img.src = attrs.src ?? '';
        img.alt = attrs.alt ?? '';
        img.style.width = `${attrs.width}px`;
        imgWrap.style.width = `${attrs.width}px`;
        wrapper.style.textAlign = attrs.align;
        sizeLabel.textContent = `${attrs.width}px`;
        alignBtns.forEach((btn) => {
          const isActive = btn.dataset.align === attrs.align;
          btn.style.background = isActive ? '#C8102E' : 'transparent';
          btn.style.color = isActive ? '#fff' : '#6b7280';
        });
      };

      syncAttrs(getAttr());

      // ── Selection: show/hide toolbar & handle ─────────────────────────────
      const setSelected = (sel: boolean) => {
        toolbar.style.display = sel ? 'flex' : 'none';
        handle.style.display  = sel ? 'flex' : 'none';
        imgWrap.style.outline = sel ? '2px solid #C8102E' : 'none';
        imgWrap.style.outlineOffset = sel ? '2px' : '0';
      };

      return {
        dom: wrapper,
        update(updatedNode) {
          if (updatedNode.type.name !== 'resizableImage') return false;
          syncAttrs({
            src:   updatedNode.attrs.src,
            alt:   updatedNode.attrs.alt,
            width: updatedNode.attrs.width,
            align: updatedNode.attrs.align,
          });
          return true;
        },
        selectNode()   { setSelected(true); },
        deselectNode() { setSelected(false); },
        destroy()      {},
      };
    };
  },
});

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function TB({ onClick, active, disabled, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
        ${active
          ? 'bg-sabc-red text-white'
          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }`}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TaskCommentEditorProps {
  taskId: string;
  taskTitle: string;
  onCommented: () => void;
}

export function TaskCommentEditor({ taskId, taskTitle, onCommented }: TaskCommentEditorProps) {
  const [task, setTask]           = useState<TaskResponse | null>(null);
  const [taskLoading, setTL]      = useState(true);
  const [toast, setToast]         = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const onCommentedRef            = useRef(onCommented);
  const editorRef                 = useRef<ReturnType<typeof useEditor>>(null);
  const prefilled                 = useRef(false);
  const successHandled            = useRef(false);
  const lastError                 = useRef<string | null>(null);

  useEffect(() => { onCommentedRef.current = onCommented; });

  const { comment, isLoading: commentLoading } = useGetComment(taskId);
  const { submit, isLoading: submitting, isSuccess, error: submitError } = useSubmitComment(taskId);

  // Load task details
  useEffect(() => {
    let dead = false;
    setTL(true);
    apiClient.get<TaskResponse>(`/api/v1/tasks/${taskId}`)
      .then((d) => { if (!dead) { setTask(d); setTL(false); } })
      .catch(() => { if (!dead) setTL(false); });
    return () => { dead = true; };
  }, [taskId]);

  // Insert base64 image — reads editorRef so it's always current
  const insertImage = (file: File) => {
    const ed = editorRef.current;
    if (!ed) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!src) return;
      ed.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: { src, alt: file.name, width: 300, align: 'left' },
      }).run();
    };
    reader.readAsDataURL(file);
  };

  const editor = useEditor({
    extensions: [StarterKit, Underline, ResizableImage],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 prose prose-sm max-w-none focus:outline-none dark:prose-invert',
      },
      handleDrop(_view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file?.type.startsWith('image/')) return false;
        event.preventDefault();
        insertImage(file);
        return true;
      },
      handlePaste(_view, event) {
        if (!event.clipboardData) return false;
        for (const item of Array.from(event.clipboardData.items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) { event.preventDefault(); insertImage(file); return true; }
          }
        }
        return false;
      },
    },
    editable: true,
  });


  editorRef.current = editor;

  // Pre-fill existing comment once
  useEffect(() => {
    if (editor && !prefilled.current && !commentLoading && comment?.content) {
      editor.commands.setContent(comment.content);
      prefilled.current = true;
    }
  }, [editor, comment, commentLoading]);

  // Success — guarded with ref to prevent re-run
  useEffect(() => {
    if (isSuccess && !successHandled.current) {
      successHandled.current = true;
      setSubmitted(true);
      editor?.setEditable(false);
      setToast({ type: 'success', message: 'Commentaire soumis avec succès !' });
      setTimeout(() => setToast(null), 3000);
      onCommentedRef.current();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  // Error
  useEffect(() => {
    if (submitError && submitError !== lastError.current) {
      lastError.current = submitError;
      setToast({ type: 'error', message: submitError });
      setTimeout(() => setToast(null), 3000);
    }
  }, [submitError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) insertImage(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!editor) return;
    submit(editor.getHTML());
  };

  if (taskLoading || commentLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  }

  const statusColor = STATUS_COLORS[task?.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-700';
  const domainColor = task ? (DOMAIN_COLORS[task.domain as keyof typeof DOMAIN_COLORS] ?? 'bg-gray-100 text-gray-700') : '';

  return (
    <div className="space-y-4 animate-fade-in">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Toast */}
      {toast && (
        <div className={`animate-slide-up p-3 rounded-xl text-sm flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Task banner */}
      {task && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-sabc-red rounded-xl p-4">
          <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{task.title}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>📅 {formatDate(task.task_date)}</span>
            <span>🕐 {formatTime(task.start_time)} – {formatTime(task.end_time)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={CATEGORY_COLORS[task.category]}>{task.category}</Badge>
            {domainColor && <Badge className={domainColor}>{task.domain}</Badge>}
            <Badge className={statusColor}>{task.status}</Badge>
          </div>
        </div>
      )}

      {/* Editor */}
      <div>
        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <TB onClick={() => editor?.chain().focus().toggleBold().run()}                          active={editor?.isActive('bold')}                   disabled={!editor} title="Gras"><Bold size={14} /></TB>
          <TB onClick={() => editor?.chain().focus().toggleItalic().run()}                        active={editor?.isActive('italic')}                 disabled={!editor} title="Italique"><Italic size={14} /></TB>
          <TB onClick={() => editor?.chain().focus().toggleUnderline().run()}                     active={editor?.isActive('underline')}               disabled={!editor} title="Souligné"><UnderlineIcon size={14} /></TB>
          <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 self-stretch" />
          <TB onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}           active={editor?.isActive('heading', { level: 1 })}  disabled={!editor} title="Titre 1"><Heading1 size={14} /></TB>
          <TB onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}           active={editor?.isActive('heading', { level: 2 })}  disabled={!editor} title="Titre 2"><Heading2 size={14} /></TB>
          <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 self-stretch" />
          <TB onClick={() => editor?.chain().focus().toggleBulletList().run()}                    active={editor?.isActive('bulletList')}             disabled={!editor} title="Liste à puces"><List size={14} /></TB>
          <TB onClick={() => editor?.chain().focus().toggleOrderedList().run()}                   active={editor?.isActive('orderedList')}            disabled={!editor} title="Liste numérotée"><ListOrdered size={14} /></TB>
          <TB onClick={() => editor?.chain().focus().toggleCode().run()}                          active={editor?.isActive('code')}                   disabled={!editor} title="Code"><Code size={14} /></TB>
          <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 self-stretch" />
          <TB onClick={() => fileInputRef.current?.click()}                                       disabled={!editor || submitted}                     title="Insérer une image depuis le PC"><ImageIcon size={14} /></TB>
        </div>

        {!submitted && (
          <p className="text-xs text-gray-400 mb-2">
            💡 <strong>🖼</strong> pour parcourir · Glisser-déposer · Coller (Ctrl+V).
            Cliquez sur l&apos;image pour la <strong>redimensionner</strong> (poignée rouge) et l&apos;<strong>aligner</strong>.
          </p>
        )}

        <EditorContent editor={editor} />
      </div>

      {!submitted && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} isLoading={submitting} disabled={submitting || !editor} size="md">
            Soumettre le commentaire
          </Button>
        </div>
      )}
    </div>
  );
}