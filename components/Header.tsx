import React from 'react';
import { Language } from '../types';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  languages: Language[];
}

export const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageChange, languages }) => {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center bg-white/10 backdrop-blur-sm shadow-md fixed top-0 left-0 right-0 z-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider" style={{ fontFamily: "'Amiri', sans-serif" }}>
        نور <span className="font-light text-2xl hidden sm:inline">NOOR</span>
      </h1>
      <div className="relative">
        <select
          value={currentLanguage.code}
          onChange={(e) => {
            const selectedLang = languages.find(l => l.code === e.target.value);
            if (selectedLang) {
              onLanguageChange(selectedLang);
            }
          }}
          className="bg-white/20 text-white py-2 px-4 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} className="text-black">
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};