"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

const BackToTopButton = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 right-8 bg-green hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
        </button>
      )}
    </>
  );
};

export default BackToTopButton;
