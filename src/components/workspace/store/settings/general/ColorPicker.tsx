'use client';

import { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn-ui/popover';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    placeholder?: string;
}

export function ColorPicker({ value, onChange, placeholder = '#000000' }: ColorPickerProps) {
    const [color, setColor] = useState(value || placeholder);

    useEffect(() => {
        if (value !== color) {
            setColor(value || placeholder);
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
                        className="w-10 h-10 rounded-md border border-input shadow-sm transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
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
                className="flex-1 font-mono text-sm uppercase"
                maxLength={7}
            />
        </div>
    );
}
