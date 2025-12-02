export enum AppView {
  HOME = 'HOME',
  CREATOR = 'CREATOR',
  BILSEM = 'BILSEM',
  COLORING = 'COLORING',
  GALLERY = 'GALLERY'
}

export interface CharacterAttributes {
  classification: string; // e.g. Tank, Ranged, Air
  element: string;        // e.g. Fire, Ice
  weapon: string;         // e.g. Sword, Hammer
}

export interface SavedCharacter {
  id: string;
  name: string;
  imageUrl: string; // Base64 or URL
  attributes: CharacterAttributes;
  createdAt: number;
}

export interface SavedDrawing {
  id: string;
  imageUrl: string;
  createdAt: number;
}

export interface BilsemQuestion {
  characters: SavedCharacter[];
  cipherMap: Record<string, number>; // Character ID -> Number
  pattern: string[]; // IDs in order
  targetId: string;
  options: number[];
  correctAnswer: number;
}

export enum ImageSize {
  S_1K = '1K',
  S_2K = '2K',
  S_4K = '4K'
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3',
  WIDE = '16:9'
}