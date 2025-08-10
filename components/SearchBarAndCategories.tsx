import React, { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Language } from '../types';

interface SearchBarAndCategoriesProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  language: Language;
}

// Add SpeechRecognition types to window for TypeScript
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const MicrophoneIcon = ({ listening }: { listening: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`w-6 h-6 transition-colors ${listening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}>
        <title>{listening ? 'Stop recording' : 'Start voice search'}</title>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

const BANNER_IMAGE_URL = "https://images.pexels.com/photos/6593580/pexels-photo-6593580.jpeg";


const SearchBarAndCategories: React.FC<SearchBarAndCategoriesProps> = ({ onSearch, isLoading, language }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser.');
        return;
    }

    if (recognitionRef.current) {
        recognitionRef.current.stop();
        return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        setIsListening(true);
    };

    recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access in your browser settings to use voice search.');
        }
        setIsListening(false);
        recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        if (transcript.trim()) {
            onSearch(transcript.trim());
        }
    };

    recognition.start();
  };
  
  useEffect(() => {
    // Cleanup recognition instance on component unmount
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  const handleCategoryClick = (category: string) => {
    onSearch(category);
  };
  
  const placeholders = {
    en: "Search by dish, ingredient, or voice...",
    bn: "খাবারের নাম, উপাদান দিয়ে বা ভয়েস দিয়ে খুঁজুন..."
  };

  return (
    <div className="p-4 md:p-6 text-center">
       <img src={BANNER_IMAGE_URL} 
             alt="A happy couple cooking together in a modern kitchen while looking at a recipe on a smartphone." 
             className="w-full max-w-4xl mx-auto h-52 md:h-64 object-cover rounded-2xl mb-8 shadow-lg"
        />
      <h2 className={`text-[30.75px] md:text-[32.5px] font-bold text-gray-100 mb-2 ${language === 'bn' ? 'font-bengali' : ''}`}>
        {language === 'en' ? "What would you like to cook?" : "আজ কি রান্না করতে চান?"}
      </h2>
      <p className={`text-base text-gray-400 mb-6 ${language === 'bn' ? 'font-bengali' : ''}`}>
        {language === 'en' ? "Find delicious recipes tailored for you." : "আপনার জন্য তৈরি সুস্বাদু রেসিপি খুঁজুন।"}
      </p>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholders[language]}
            disabled={isLoading}
            className={`w-full pl-12 pr-32 md:pr-40 py-4 bg-gray-800 border-2 border-gray-700 text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow duration-300 text-lg ${language === 'bn' ? 'font-bengali' : ''}`}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
             <button
                type="button"
                onClick={handleVoiceSearch}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
                aria-label={language === 'en' ? 'Search by voice' : 'ভয়েস দিয়ে খুঁজুন'}
              >
                <MicrophoneIcon listening={isListening} />
              </button>
              <button type="submit" disabled={isLoading || !query.trim()} className="ml-1 px-4 md:px-6 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300">
                <span className={`text-base ${language === 'bn' ? 'font-bengali' : ''}`}>{language === 'en' ? 'Search' : 'খুঁজুন'}</span>
              </button>
          </div>
        </div>
      </form>

      <div className="max-w-4xl mx-auto">
        <h3 className={`text-[20.5px] font-semibold text-gray-300 mb-4 ${language === 'bn' ? 'font-bengali' : ''}`}>
          {language === 'en' ? "Or browse by category" : "অথবা বিভাগ থেকে ব্রাউজ করুন"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              disabled={isLoading}
              className="relative aspect-square rounded-lg overflow-hidden group shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex items-center justify-center p-2">
                <h4 className={`text-white font-bold text-[18.25px] text-center ${language === 'bn' ? 'font-bengali' : ''}`}>
                  {category.name}
                </h4>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBarAndCategories;