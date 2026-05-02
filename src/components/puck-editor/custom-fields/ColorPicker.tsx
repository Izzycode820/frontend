'use client';

import { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn-ui/popover';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    name: string;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [color, setColor] = useState(value || '#000000');

    useEffect(() => {
        if (value !== color) {
            setColor(value || '#000000');
        }
    }, [value]);

    const handleChange = (result: ColorResult) => {
        setColor(result.hex);
        onChange(result.hex);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setColor(val);
        if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(val)) {
            onChange(val);
        }
    };

    return (
        <div className="flex gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="w-9 h-9 flex-shrink-0 rounded-md border border-input shadow-sm transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl z-[9999]" align="start">
                    <SketchPicker
                        color={color}
                        onChangeComplete={handleChange}
                        disableAlpha={true}
                        width="220px"
                    />
                </PopoverContent>
            </Popover>
            <Input
                value={color}
                onChange={handleInputChange}
                className="flex-1 font-mono text-sm uppercase h-9"
                maxLength={7}
            />
        </div>
    );
}
