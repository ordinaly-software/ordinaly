import React from 'react';
import { Switch } from 'glisse';

interface SliderProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  /** Kept for API compatibility; glisse draws its own accent colour. */
  color?: 'green' | 'orange' | 'blue' | 'red' | 'clay' | string;
  disabled?: boolean;
  'aria-label'?: string;
}

const Slider: React.FC<SliderProps> = ({ checked, onChange, className, disabled = false, 'aria-label': ariaLabel }) => (
  <Switch
    checked={checked}
    onCheckedChange={() => onChange()}
    disabled={disabled}
    className={className}
    aria-label={ariaLabel ?? 'Toggle'}
  />
);

export default Slider;
