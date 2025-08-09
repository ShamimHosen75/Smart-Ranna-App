
export interface Recipe {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  youtubeSearchQuery: string;
}

export interface TranslatedRecipe {
  ingredients: string[];
  instructions: string[];
}

export type Language = 'en' | 'bn';

export enum View {
  Home,
  RecipeList,
  RecipeDetail,
  Bookmarks,
}
