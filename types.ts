
export interface Recipe {
  id: string; // Client-side unique ID
  name_en: string;
  name_bn: string;
  category: string;
  imageBase64: string;
  ingredients_en: string[];
  ingredients_bn: string[];
  steps_en: string[];
  steps_bn: string[];
  youtube_link: string;
  youtube_link_is_suggested: boolean;
}

export type Language = 'en' | 'bn';

export enum View {
  Home,
  RecipeList,
  RecipeDetail,
  Bookmarks,
}