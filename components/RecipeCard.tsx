
import React from 'react';
import { Recipe, Language } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, language, isFavorite, onToggleFavorite }) => {
  const recipeName = language === 'bn' ? recipe.name_bn : recipe.name_en;

  return (
    <div
      className="bg-gray-800 rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 relative"
    >
      <div onClick={() => onSelect(recipe)} className="cursor-pointer">
        <img src={recipe.imageBase64} alt={recipeName} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
        <div className="p-4">
          <p className={`text-sm font-semibold text-orange-500 uppercase ${language === 'bn' ? 'font-bengali' : ''}`}>
              {recipe.category}
          </p>
          <h3 className={`text-[20.5px] font-bold text-gray-100 mt-1 truncate ${language === 'bn' ? 'font-bengali' : ''}`} title={recipeName}>
              {recipeName}
          </h3>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(recipe);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${isFavorite ? 'text-red-500 bg-white/20' : 'text-white bg-black/30 hover:bg-black/50'}`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <HeartIcon filled={isFavorite} />
      </button>
    </div>
  );
};

export default RecipeCard;