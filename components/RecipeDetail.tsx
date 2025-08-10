import React from "react";
import { Language, Recipe } from "../types";

interface RecipeDetailProps {
 recipe: Recipe;
 onBack: () => void;
 language: Language;
 isFavorite: boolean;
 onToggleFavorite: (recipe: Recipe) => void;
}

const BackArrowIcon = () => (
 <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-5 h-5 mr-2"
 >
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
 </svg>
);

const YouTubeIcon = () => (
 <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-5 h-5 mr-2"
 >
  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
  <path d="m10 15 5-3-5-3z" />
 </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
 <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-6 w-6"
  fill={filled ? "currentColor" : "none"}
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth="2"
 >
  <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
  />
 </svg>
);

const RecipeDetail: React.FC<RecipeDetailProps> = ({
 recipe,
 onBack,
 language,
 isFavorite,
 onToggleFavorite,
}) => {
 const recipeName = language === "bn" ? recipe.name_bn : recipe.name_en;
 const ingredients =
  language === "bn" ? recipe.ingredients_bn : recipe.ingredients_en;
 const instructions = language === "bn" ? recipe.steps_bn : recipe.steps_en;

 const favoriteButtonText = {
  en: {
   favorite: "Favorite",
   favorited: "Favorited",
  },
  bn: {
   favorite: "প্রিয়",
   favorited: "প্রিয় তালিকাভুক্ত",
  },
 };

 return (
  <div className="animate-fade-in">
   <div className="p-4 sticky top-[81px] bg-gray-900 z-10 border-b border-gray-800">
    <button
     onClick={onBack}
     className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-full font-semibold text-sm text-gray-300 hover:bg-gray-700 transition-colors"
    >
     <BackArrowIcon />
     <span className={language === "bn" ? "font-bengali" : ""}>
      {language === "en" ? "Back to Recipes" : "রেসিপি তালিকায় ফিরুন"}
     </span>
    </button>
   </div>

   <div className="p-4 md:p-6">
    <img
     src={recipe.imageBase64}
     alt={recipeName}
     className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl shadow-lg mb-6"
    />

    <h2
     className={`text-[30.5px] md:text-[40px] font-bold text-gray-100 mb-2 ${
      language === "bn" ? "font-bengali" : ""
     }`}
    >
     {recipeName}
    </h2>
    <p
     className={`text-base font-semibold text-orange-500 mb-4 ${
      language === "bn" ? "font-bengali" : ""
     }`}
    >
     {recipe.category}
    </p>

    <div className="flex flex-wrap gap-2 items-center mb-8">
     {recipe.youtube_link && (
      <div className="flex items-center gap-3">
       <a
        href={recipe.youtube_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-5 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105"
       >
        <YouTubeIcon />
        <span
         className={`text-base ${language === "bn" ? "font-bengali" : ""}`}
        >
         {language === "en" ? "Watch Tutorial" : "টিউটোরিয়াল দেখুন"}
        </span>
       </a>
       {/* {recipe.youtube_link_is_suggested && (
        <span
         className={`px-3 py-1 text-sm font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 ${
          language === "bn" ? "font-bengali" : ""
         }`}
        >
         {language === "en" ? "Suggested" : "প্রস্তাবিত"}
        </span>
       )} */}
      </div>
     )}
     <button
      onClick={() => onToggleFavorite(recipe)}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-lg border-2 transition-colors ${
       isFavorite
        ? "bg-red-500 border-red-500 text-white"
        : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
      }`}
     >
      <HeartIcon filled={isFavorite} />
      <span className={`text-base ${language === "bn" ? "font-bengali" : ""}`}>
       {isFavorite
        ? favoriteButtonText[language].favorited
        : favoriteButtonText[language].favorite}
      </span>
     </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
      <h3
       className={`text-[25px] font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2 ${
        language === "bn" ? "font-bengali" : ""
       }`}
      >
       {language === "en" ? "Ingredients" : "উপকরণ"}
      </h3>
      <ul className="space-y-3">
       {ingredients.map((item, index) => (
        <li
         key={index}
         className={`text-base text-gray-300 flex items-start ${
          language === "bn" ? "font-bengali" : ""
         }`}
        >
         <span className="text-orange-500 mr-3 mt-1 flex-shrink-0">
          &#10003;
         </span>
         {item}
        </li>
       ))}
      </ul>
     </div>

     <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg">
      <h3
       className={`text-[25px] font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2 ${
        language === "bn" ? "font-bengali" : ""
       }`}
      >
       {language === "en" ? "Instructions" : "প্রস্তুত প্রণালী"}
      </h3>
      <ol className="space-y-5">
       {instructions.map((step, index) => (
        <li
         key={index}
         className={`flex items-start text-base text-gray-300 ${
          language === "bn" ? "font-bengali" : ""
         }`}
        >
         <span className="flex-shrink-0 mr-4 h-8 w-8 bg-orange-500 text-white font-bold text-base rounded-full flex items-center justify-center">
          {index + 1}
         </span>
         <p className="pt-1">{step}</p>
        </li>
       ))}
      </ol>
     </div>
    </div>
   </div>
  </div>
 );
};

export default RecipeDetail;
