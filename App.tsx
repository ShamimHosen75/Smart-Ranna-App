import React, { useState, useCallback, useEffect } from 'react';
import { Recipe, Language, View } from './types';
import Header from './components/Header';
import SearchBarAndCategories from './components/SearchBarAndCategories';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import Spinner from './components/Spinner';
import { fetchRecipesFromAI } from './services/geminiService';

const RecipeCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-700"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
);


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    try {
        const saved = localStorage.getItem('ranna-banna-favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to load favorites from localStorage", e);
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('ranna-banna-favorites', JSON.stringify(favorites));
    } catch (e) {
        console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
        const isFavorite = prev.some(fav => fav.id === recipe.id);
        if (isFavorite) {
            return prev.filter(fav => fav.id !== recipe.id);
        } else {
            return [...prev, recipe];
        }
    });
  }, []);

  const isFavorite = (recipeId: string) => {
    return favorites.some(fav => fav.id === recipeId);
  }

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    setCurrentView(View.RecipeList);
    try {
      const fetchedRecipes = await fetchRecipesFromAI(query);
      setRecipes(fetchedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView(View.RecipeDetail);
  };

  const handleBack = () => {
    setError(null);
    if (currentView === View.RecipeDetail) {
      setCurrentView(View.RecipeList);
      setSelectedRecipe(null);
    } else if (currentView === View.RecipeList || currentView === View.Bookmarks) {
      setCurrentView(View.Home);
      setRecipes([]);
    }
  };
  
  const handleLogoClick = () => {
      setCurrentView(View.Home);
      setRecipes([]);
      setSelectedRecipe(null);
      setError(null);
  }
  
  const handleBookmarksClick = () => {
      setCurrentView(View.Bookmarks);
  }

  const renderContent = () => {
    if (isLoading && currentView === View.RecipeList) {
      return (
         <div className="p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col justify-center items-center mb-8 gap-4 text-center">
              <Spinner size="lg" />
              <p className={`text-xl text-gray-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
                {language === 'en' ? `Cooking up recipes for "${searchQuery}"...` : `"${searchQuery}" এর জন্য রেসিপি তৈরি করা হচ্ছে...`}
              </p>
              <p className="text-base text-gray-500">(This might take a moment as our AI chef finds the best recipes)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => <RecipeCardSkeleton key={index} />)}
            </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button onClick={handleBack} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Try Again
          </button>
        </div>
      );
    }

    switch (currentView) {
      case View.Home:
        return <SearchBarAndCategories 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            language={language}
        />;
      
      case View.RecipeList:
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <button onClick={handleBack} className="mb-6 flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-full font-semibold text-base text-gray-300 hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span className={language === 'bn' ? 'font-bengali' : ''}>{language === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}</span>
            </button>
            <h2 className="text-[31.75px] font-bold mb-6 text-gray-100">
              <span className={language === 'bn' ? 'font-bengali' : ''}>
                {language === 'en' ? 'Search Results' : 'অনুসন্ধানের ফলাফল'}
              </span>: <span className="text-orange-500">{searchQuery}</span>
            </h2>
            {recipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onSelect={handleSelectRecipe} language={language} isFavorite={isFavorite(recipe.id)} onToggleFavorite={toggleFavorite} />
                ))}
                </div>
            ) : (
                <p className={`text-center text-lg text-gray-400 mt-10 ${language === 'bn' ? 'font-bengali' : ''}`}>
                    {language === 'en' ? 'No recipes found. Try a different search!' : 'কোনো রেসিপি খুঁজে পাওয়া যায়নি। অন্য কিছু দিয়ে চেষ্টা করুন!'}
                </p>
            )}
          </div>
        );

      case View.Bookmarks:
        return (
          <div className="p-4 md:p-6 animate-fade-in">
            <button onClick={handleBack} className="mb-6 flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-full font-semibold text-base text-gray-300 hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span className={language === 'bn' ? 'font-bengali' : ''}>{language === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}</span>
            </button>
            <h2 className="text-[31.75px] font-bold mb-6 text-gray-100">
              <span className={language === 'bn' ? 'font-bengali' : ''}>
                {language === 'en' ? 'Bookmarked Recipes' : 'বুকমার্ক করা রেসিপি'}
              </span>
            </h2>
            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onSelect={handleSelectRecipe} language={language} isFavorite={isFavorite(recipe.id)} onToggleFavorite={toggleFavorite} />
                ))}
                </div>
            ) : (
                <p className={`text-center text-lg text-gray-400 mt-10 ${language === 'bn' ? 'font-bengali' : ''}`}>
                    {language === 'en' ? 'You have no bookmarked recipes.' : 'আপনার কোনো বুকমার্ক করা রেসিপি নেই।'}
                </p>
            )}
          </div>
        );
        
      case View.RecipeDetail:
        return selectedRecipe ? (
          <RecipeDetail recipe={selectedRecipe} onBack={handleBack} language={language} isFavorite={isFavorite(selectedRecipe.id)} onToggleFavorite={toggleFavorite} />
        ) : null;
        
      default:
        return <SearchBarAndCategories 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            language={language}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        onLogoClick={handleLogoClick}
        onBookmarksClick={handleBookmarksClick}
      />
      <main>
        {renderContent()}
      </main>
      <footer className="text-center p-6 text-gray-500 text-sm">
        <p>© 2025 Qtec Agency - All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;