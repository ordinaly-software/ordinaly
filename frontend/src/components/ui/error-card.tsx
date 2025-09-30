import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  iconBgClass?: string;
  iconColorClass?: string;
  title: string;
  message: string;
  buttonText: string;
  onRetry: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({
  iconBgClass = "bg-red-100 dark:bg-red-900/20",
  iconColorClass = "text-red-600 dark:text-red-400",
  title,
  message,
  buttonText,
  onRetry,
}) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto bg-white dark:bg-[#23272F] rounded-xl shadow-lg p-8">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${iconBgClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {buttonText}
        </Button>
      </div>
    </div>
  </div>
);

export default ErrorCard;
