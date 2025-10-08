"use client";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./navbar"), {
  ssr: false,
  loading: () => (
    <nav className="w-full h-[60px] sm:h-[72px] flex items-center px-4 sm:px-8 bg-white dark:bg-[#1A1924] border-b border-gray-200 dark:border-gray-800 animate-pulse" aria-label="Navbar skeleton" />
  ),
});

export default function NavbarWrapper() {
  return <Navbar />;
}
