import React from 'react';
import { CanvasPage } from '../types';

interface CanvasTabsProps {
  pages: CanvasPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
}

export const CanvasTabs: React.FC<CanvasTabsProps> = ({ pages, activePageIndex, onSelectPage, onAddPage }) => {
  return (
    <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 pl-2 flex items-center">
      <div className="flex-grow flex items-center gap-1 overflow-x-auto">
        {pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => onSelectPage(index)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              index === activePageIndex
                ? 'bg-white border-blue-500 text-blue-600'
                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200 hover:border-gray-300'
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>
      <button
        onClick={onAddPage}
        className="ml-2 mr-2 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-500 transition-colors"
        aria-label="Add new page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
};