'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/shadcn-ui/button';
import { Separator } from '@/components/shadcn-ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 'min-h-[200px]' }: RichTextEditorProps) {
  const t = useTranslations('Shared.editor');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-sm w-full max-w-none break-words focus:outline-none ${minHeight} max-h-[60vh] overflow-y-auto overflow-x-hidden p-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_*]:overflow-wrap-anywhere`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (editor.getText() === '' && value === '') return;
      // Note: We avoid setting content if it's just a cursor move to prevent jumping
      // But for initial load or external reset, we need this.
       if (!editor.isFocused) {
          editor.commands.setContent(value);
       }
    }
  }, [value, editor]);


  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-lg overflow-x-hidden bg-background focus-within:ring-2 focus-within:ring-ring transition-all max-w-full">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b overflow-x-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive('bold') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label={t('bold')}
            title={t('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive('italic') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label={t('italic')}
            title={t('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive('underline') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label={t('underline')}
            title={t('underline')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive('bulletList') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label={t('bulletList')}
            title={t('bulletList')}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive('orderedList') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label={t('orderedList')}
            title={t('orderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            aria-label={t('alignLeft')}
            title={t('alignLeft')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            aria-label={t('alignCenter')}
            title={t('alignCenter')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            aria-label={t('alignRight')}
            title={t('alignRight')}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full max-w-full overflow-x-hidden">
          <EditorContent 
            editor={editor} 
            className="w-full max-w-full [&_.ProseMirror]:w-full [&_.ProseMirror]:max-w-full [&_.ProseMirror]:overflow-x-hidden [&_.ProseMirror]:overflow-wrap-anywhere [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:word-break-break-word" 
          />
        </div>
      </div>
       {/* Helper text for placeholder if empty */}
       {editor.isEmpty && placeholder && (
          <div className="pointer-events-none absolute top-[52px] left-4 text-sm text-muted-foreground">
             {placeholder}
          </div>
       )}
    </div>
  );
}
