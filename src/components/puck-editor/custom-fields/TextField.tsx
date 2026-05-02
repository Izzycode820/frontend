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
  Type,
  Sparkles,
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { useEffect, useState } from 'react';
import { Extension } from '@tiptap/core';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export function TextField({ value, onChange }: TextFieldProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // Custom extension for font size and color using inline styles
      Extension.create({
        name: 'typography',
        addOptions() {
          return {
            types: ['textStyle'],
          };
        },
        addGlobalAttributes() {
          return [
            {
              types: ['textStyle'],
              attributes: {
                fontSize: {
                  default: null,
                  parseHTML: element => element.style.fontSize,
                  renderHTML: attributes => {
                    if (!attributes.fontSize) return {};
                    return { style: `font-size: ${attributes.fontSize}` };
                  },
                },
                color: {
                  default: null,
                  parseHTML: element => element.style.color,
                  renderHTML: attributes => {
                    if (!attributes.color) return {};
                    return { style: `color: ${attributes.color}` };
                  },
                },
                letterSpacing: {
                  default: null,
                  parseHTML: element => element.style.letterSpacing,
                  renderHTML: attributes => {
                    if (!attributes.letterSpacing) return {};
                    return { style: `letter-spacing: ${attributes.letterSpacing}` };
                  },
                },
                textShadow: {
                  default: null,
                  parseHTML: element => element.style.textShadow,
                  renderHTML: attributes => {
                    if (!attributes.textShadow) return {};
                    return { style: `text-shadow: ${attributes.textShadow}` };
                  },
                },
              },
            },
          ];
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm w-full max-w-none focus:outline-none min-h-[100px] p-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value changes from outside (e.g. undo/redo from parent or init)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if content is different to avoid cursor jumping
      // Simple check, implies incomplete sync but good enough for prop updates
      if (editor.getText() === '' && value === '') return;
      // editor.commands.setContent(value); 
      // Note: setContent can reset cursor. 
      // Ideal for controlled inputs is complex. 
      // For Puck, often value update comes from this component itself.
    }
  }, [value, editor]);


  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-lg overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring transition-all">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b overflow-x-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive('bold') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive('italic') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive('underline') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive('bulletList') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive('orderedList') ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 hover:bg-accent ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent/50 text-accent-foreground' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Select
            value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
            onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
          >
            <SelectTrigger className="h-7 w-[100px] px-2 text-[10px] border-none bg-transparent hover:bg-accent">
               <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {[
                'Inter', 'Roboto', 'Outfit', 'Montserrat', 'Poppins', 
                'Playfair Display', 'Bebas Neue', 'Space Grotesk', 
                'Syne', 'Oswald', 'Lora', 'Raleway'
              ].map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }} className="text-xs">{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* Letter Spacing */}
          <Select
            value={editor.getAttributes('textStyle').letterSpacing || 'normal'}
            onValueChange={(value) => editor.chain().focus().setMark('textStyle', { letterSpacing: value }).run()}
          >
            <SelectTrigger className="h-7 w-[75px] px-2 text-[10px] border-none bg-transparent hover:bg-accent" title="Letter Spacing">
              <Type className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Spacing" />
            </SelectTrigger>
            <SelectContent>
              {[
                { label: 'Tight', value: '-0.05em' },
                { label: 'Normal', value: 'normal' },
                { label: 'Wide', value: '0.05em' },
                { label: 'Extra Wide', value: '0.1em' },
                { label: 'Mega Wide', value: '0.2em' },
              ].map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* Effects */}
          <Select
            value={editor.getAttributes('textStyle').textShadow || 'none'}
            onValueChange={(value) => editor.chain().focus().setMark('textStyle', { textShadow: value }).run()}
          >
            <SelectTrigger className="h-7 w-[75px] px-2 text-[10px] border-none bg-transparent hover:bg-accent" title="Text Effects">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Effect" />
            </SelectTrigger>
            <SelectContent>
              {[
                { label: 'None', value: 'none' },
                { label: 'Soft Glow', value: '0 0 8px rgba(255,255,255,0.5)' },
                { label: 'Sharp Shadow', value: '2px 2px 0px rgba(0,0,0,0.5)' },
                { label: 'Neon Blue', value: '0 0 10px #0ea5e9, 0 0 20px #0ea5e9' },
                { label: 'Elevated', value: '0 10px 20px rgba(0,0,0,0.3)' },
              ].map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* Font Size */}
          <Select
            value={editor.getAttributes('textStyle').fontSize || '16px'}
            onValueChange={(value) => editor.chain().focus().setMark('textStyle', { fontSize: value }).run()}
          >
            <SelectTrigger className="h-7 w-[70px] px-2 text-[10px] border-none bg-transparent hover:bg-accent">
               <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {['12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px', '48px', '56px', '64px', '72px'].map(size => (
                <SelectItem key={size} value={size} className="text-xs">{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* Color Picker */}
          <div className="flex items-center">
            <ColorPicker 
                name="text-color"
                value={editor.getAttributes('textStyle').color || '#000000'} 
                onChange={(color) => editor.chain().focus().setMark('textStyle', { color }).run()}
            />
          </div>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
