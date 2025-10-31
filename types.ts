export interface Language {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
}

export interface Source {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  text: string;
  sources: Source[];
}

export interface VocabularyItem {
  arabic: string;
  english: string;
  hausa: string;
}
