'use client';

import { Slider as ShadcnSlider } from '@/components/shadcn-ui/slider';
import { Input } from '@/components/shadcn-ui/input';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

/**
 * Slider - Visual number control with preview
 */
export function Slider({ value, onChange, min = 0, max = 100, step = 1, unit = '' }: SliderProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || min;
    onChange(Math.min(Math.max(newValue, min), max));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ShadcnSlider
            value={[value]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-1 w-20">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="h-8 text-sm text-right px-2"
          />
          {unit && (
            <span className="text-xs text-muted-foreground">{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}
