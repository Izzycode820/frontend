'use client';

import { useState } from 'react';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { Separator } from '@/components/shadcn-ui/separator';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * TextField - Enhanced text editor with formatting toolbar
 * Clean, Shopify-style text editing experience
 */
export function TextField({ value, onChange }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const applyFormat = (tag: string, openTag: string, closeTag: string) => {
    const textarea = document.querySelector('[data-text-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';

    const before = value.substring(0, start);
    const after = value.substring(end);

    const newValue = `${before}${openTag}${selectedText}${closeTag}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div
        className={`border rounded-lg overflow-hidden transition-all ${
          isFocused ? 'ring-2 ring-ring' : ''
        }`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent"
            onClick={() => applyFormat('bold', '<b>', '</b>')}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent"
            onClick={() => applyFormat('italic', '<i>', '</i>')}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent"
            onClick={() => applyFormat('underline', '<u>', '</u>')}
          >
            <Underline className="h-3.5 w-3.5" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent"
            onClick={() => applyFormat('ul', '<ul><li>', '</li></ul>')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent"
            onClick={() => applyFormat('ol', '<ol><li>', '</li></ol>')}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Editor */}
        <Textarea
          data-text-editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="min-h-[100px] border-0 focus-visible:ring-0 resize-none font-sans"
          placeholder="Enter description..."
        />
      </div>
    </div>
  );
}
