import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex space-x-2 bg-white/10 p-1 rounded-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-2 text-sm md:text-base font-semibold rounded-full transition-colors duration-300 focus:outline-none ${
              activeTab === tab.id
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-transparent text-white/80 hover:bg-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
