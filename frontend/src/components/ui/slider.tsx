import React from 'react';

interface SliderProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ checked, onChange, className = '' }) => {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 ${
        checked ? 'bg-[#22A60D]' : 'bg-muted'
      } ${className}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      ></div>
    </button>
  );
};

export default Slider;
