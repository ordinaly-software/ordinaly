import React from 'react';


interface SliderProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  color?: 'green' | 'orange' | 'blue' | 'red' | string;
}


const colorClassMap: Record<string, string> = {
  green: 'bg-green-600',
  orange: 'bg-orange-600',
  blue: 'bg-blue-600',
  red: 'bg-red-600',
  purple: 'bg-purple',
};

const Slider: React.FC<SliderProps> = ({ checked, onChange, className = '', color = 'green' }) => {
  const checkedBg = colorClassMap[color] || colorClassMap['green'];
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 ${
        checked ? checkedBg : 'bg-muted'
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
