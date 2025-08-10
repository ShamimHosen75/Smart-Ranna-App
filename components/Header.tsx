import React from "react";
import { Language } from "../types";
import Logo from "./Logo";

interface HeaderProps {
 language: Language;
 setLanguage: (lang: Language) => void;
 onLogoClick: () => void;
 onBookmarksClick: () => void;
}

const BookmarkIcon = () => (
 <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-6 w-6"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth="2"
 >
  <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
  />
 </svg>
);

const Header: React.FC<HeaderProps> = ({
 language,
 setLanguage,
 onLogoClick,
 onBookmarksClick,
}) => {
 return (
  <header className="bg-gray-800 shadow-lg p-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-700">
   <div className="flex items-center gap-3">
    <div
     onClick={onLogoClick}
     className="flex items-center gap-1 cursor-pointer"
    >
     <Logo className="h-8 w-8" />
     <h1 className="text-[15.5px] md:text-[20px] font-bold text-gray-100">
      <span className={language === "bn" ? "font-bengali" : ""}>
       {language === "en" ? "Smart Ranna" : "স্মার্ট রান্না"}
      </span>
     </h1>
    </div>
   </div>
   <div className="flex items-center space-x-4">
    <button
     onClick={onBookmarksClick}
     className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors"
     aria-label={language === "en" ? "View Bookmarks" : "বুকমার্ক দেখুন"}
    >
     <BookmarkIcon />
     <span
      className={`hidden sm:inline text-sm font-semibold ${
       language === "bn" ? "font-bengali" : ""
      }`}
     >
      {language === "en" ? "Bookmarks" : "বুকমার্ক"}
     </span>
    </button>
    <div className="flex items-center space-x-1 bg-gray-700 p-1 rounded-full">
     <button
      onClick={() => setLanguage("en")}
      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
       language === "en"
        ? "bg-orange-500 text-white"
        : "text-gray-300 hover:bg-gray-600"
      }`}
     >
      EN
     </button>
     <button
      onClick={() => setLanguage("bn")}
      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
       language === "bn"
        ? "bg-orange-500 text-white font-bengali"
        : "text-gray-300 font-bengali hover:bg-gray-600"
      }`}
     >
      বাং
     </button>
    </div>
   </div>
  </header>
 );
};

export default Header;
