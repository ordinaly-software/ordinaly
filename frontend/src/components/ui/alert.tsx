"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const styleMap = {
  success: {
    bg: "bg-[#E8F8E5] dark:bg-[#1B3A27]",
    border: "border-[#1F8A0D] dark:border-[#3FBD6F]",
    text: "text-[#1F8A0D] dark:text-[#3FBD6F]",
    icon: "text-[#1F8A0D] dark:text-[#3FBD6F]",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-950",
    border: "border-red-500 dark:border-red-400",
    text: "text-red-800 dark:text-red-200",
    icon: "text-red-600 dark:text-red-300",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-950",
    border: "border-blue-500 dark:border-blue-400",
    text: "text-blue-800 dark:text-blue-200",
    icon: "text-blue-600 dark:text-blue-300",
  },
  warning: {
    bg: "bg-yellow-100 dark:bg-yellow-950",
    border: "border-yellow-500 dark:border-yellow-400",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: "text-yellow-600 dark:text-yellow-300",
  },
};

type AlertType = keyof typeof styleMap;

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, duration = 5000 }) => {
  const { bg, border, text, icon } = styleMap[type];
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Trigger entrance animation
    const showTimeout = setTimeout(() => setIsVisible(true), 10);
    
    if (!onClose) return () => clearTimeout(showTimeout);
    
    // Handle auto-close with exit animation
    const closeTimeout = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before calling onClose
      setTimeout(onClose, 200);
    }, duration);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(closeTimeout);
    };
  }, [onClose, duration]);

  const handleClose = () => {
    if (!onClose) return;
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    isMounted
      ? createPortal(
          <div
            className={`fixed top-20 left-1/2 z-[1000] w-[90%] max-w-md transition-all duration-200 ease-out ${
              isVisible && !isExiting
                ? "transform -translate-x-1/2 translate-y-0"
                : "transform -translate-x-1/2 -translate-y-4"
            }`}
          >
            <div
              role="alert"
              className={`${bg} ${border} ${text} border-l-4 px-4 py-3 rounded-lg flex items-center justify-between shadow-lg transition-all duration-200 ease-out ${
                isVisible && !isExiting ? "scale-100" : "scale-95"
              }`}
            >
              <div className="flex items-center">
                <svg
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 mr-2 ${icon}`}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm font-medium">{message}</p>
              </div>
              {onClose && (
                <button
                  onClick={handleClose}
                  className={`${text} ml-4 text-sm hover:opacity-70 transition-opacity duration-150`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>,
          document.body
        )
      : null
  );
};

export default Alert;
