"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl"

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
}

export default function DemoModal({ isOpen, onClose, videoSrc = "/static/demo-video-1.webm" }: DemoModalProps) {
  const t = useTranslations("home");
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle video playback when modal opens/closes
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error(t("demoModal.videoError"), error);
      });
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen, t]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Handle escape key press
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = ""; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Don't render anything if the modal is closed
  if (!isOpen) return null;

  // Use createPortal to render the modal at the document body level
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div ref={modalRef} className="relative z-10 w-full max-w-5xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1924] shadow-2xl">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Video Player */}
          <div className="aspect-video w-full max-h-[80vh]">
            <video ref={videoRef} className="w-full h-full object-cover" controls playsInline src={videoSrc}>
              {t("demoModal.videoNotSupported")}
            </video>
          </div>

          {/* Video Info */}
          <div className="p-6 bg-gradient-to-b from-transparent to-white/5 dark:to-black/20">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#32E875] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
              {t("demoModal.title")}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              {t("demoModal.description")}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
