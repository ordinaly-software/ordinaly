"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface DropdownTheme {
  accent: string; // Color for selected items and focus states
  hoverBg: string; // Background color on hover
  selectedBg: string; // Background color for selected items
  focusBorder: string; // Border color on focus
  focusRing: string; // Ring color on focus
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
  disabled?: boolean;
  minWidth?: string;
  width?: string;
  direction?: "down" | "up";
  position?: 'left' | 'right' | 'center';
  offset?: string;
  children?: ReactNode;
  theme?: 'default' | 'orange' | DropdownTheme;
  renderTrigger?: (props: {
    isOpen: boolean;
    selectedOption: DropdownOption | undefined;
    onClick: () => void;
    disabled?: boolean;
  }) => ReactNode;
}

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  icon: Icon,
  className = "",
  dropdownClassName = "",
  buttonClassName = "",
  disabled = false,
  minWidth = "200px",
  width,
  children,
  theme = 'default',
  direction = "down",
  renderTrigger
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerClass = `${placeholder.toLowerCase().replace(/\s+/g, '-')}-dropdown-container`;

  const selectedOption = options.find(option => option.value === value);

  // Theme configuration
  const themes: Record<string, DropdownTheme> = {
    default: {
      accent: 'text-green-600',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      selectedBg: 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100',
      focusBorder: 'focus:border-green-600',
      focusRing: 'focus:ring-green-600/20'
    },
    orange: {
      accent: 'text-orange-500',
      hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      selectedBg: 'bg-orange-50 text-orange-900 dark:bg-orange-900/20 dark:text-orange-100',
      focusBorder: 'focus:border-orange-500',
      focusRing: 'focus:ring-orange-500/20'
    }
  };

  const currentTheme = typeof theme === 'string' ? themes[theme] : theme;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
    
      if (
        isOpen &&
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = options.length * 50 + 16; // Approximate height per option + padding
      
      let top: number;
      if (direction === "down") {
        top = rect.bottom + window.scrollY + 8;
      } else {
        // For "up" direction, position above the trigger
        top = rect.top + window.scrollY - dropdownHeight - 8;
      }

      setDropdownPosition({
        top,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [direction, isOpen, options.length]);

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={cn(
        "h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg",
        currentTheme.focusBorder, "text-gray-900 dark:text-white",
        "hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200",
        "flex items-center justify-between focus:outline-none focus:ring-2", currentTheme.focusRing,
        "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600",
        buttonClassName
      )}
      style={{ 
        minWidth: width || minWidth,
        width: width || 'auto'
      }}
    >
      <span className="truncate">
        {selectedOption?.label || placeholder}
      </span>
      <ChevronDown 
        className={cn(
          "h-4 w-4 transition-transform duration-200 ml-2 flex-shrink-0",
          isOpen ? 'rotate-180' : 'rotate-0'
        )} 
      />
    </button>
  );

  return (
    <div className={cn("relative", containerClass, className)}>
      {children ? (
        <div className="flex items-center gap-2">
          {children}
          {renderTrigger ? 
            renderTrigger({ isOpen, selectedOption, onClick: () => !disabled && setIsOpen(!isOpen), disabled }) :
            triggerButton
          }
        </div>
      ) : (
        <>
          {Icon && (
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-gray-400" />
              {renderTrigger ? 
                renderTrigger({ isOpen, selectedOption, onClick: () => !disabled && setIsOpen(!isOpen), disabled }) :
                triggerButton
              }
            </div>
          )}
          {!Icon && (
            renderTrigger ? 
              renderTrigger({ isOpen, selectedOption, onClick: () => !disabled && setIsOpen(!isOpen), disabled }) :
              triggerButton
          )}
        </>
      )}

      {/* Dropdown Menu */}
      {isOpen && options.length > 0 &&
        createPortal(
          <div 
            ref={dropdownRef}
            className={cn(
              "absolute bg-white/95 dark:bg-[#0b1220]/95 border border-white/30 dark:border-white/15",
              "rounded-2xl shadow-2xl overflow-hidden animate-in duration-200 backdrop-blur",
              direction === "up" ? "slide-in-from-top-2" : "slide-in-from-bottom-2",
              dropdownClassName
            )}
            style={{ 
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              position: 'absolute',
              zIndex: 99999,
              transform: "translateY(0)"
            }}
          >
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between",
                    value === option.value 
                      ? currentTheme.selectedBg
                      : "text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {OptionIcon && <OptionIcon className="h-4 w-4" />}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <Check className={cn("h-4 w-4", currentTheme.accent)} />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default Dropdown;
