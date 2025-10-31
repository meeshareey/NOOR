import React from 'react';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  placeholder: string;
  buttonText: string;
  dir: 'ltr' | 'rtl';
  onAttachFile: () => void;
  imageAttached: boolean;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const AttachmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);


export const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, handleSearch, isLoading, placeholder, buttonText, dir, onAttachFile, imageAttached }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };
    
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center shadow-2xl rounded-full overflow-hidden bg-white">
         <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 z-10">
            <button onClick={onAttachFile} className="text-gray-500 hover:text-teal-500 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Attach file">
                <AttachmentIcon />
            </button>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          dir={dir}
          className="w-full py-4 pr-6 pl-16 text-lg text-gray-700 focus:outline-none placeholder-gray-500 bg-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || (!query.trim() && !imageAttached)}
          className="absolute right-0 top-0 bottom-0 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-6 transition-colors duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <SearchIcon />
          )}
        </button>
      </div>
    </div>
  );
};