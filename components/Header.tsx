import React from 'react';
import { ClearIcon, PanelRightIcon } from '../constants';

interface HeaderProps {
  onGenerate: () => void;
  isGenerating: boolean;
  onClear: () => void;
  isOutputCollapsed: boolean;
  onToggleOutput: () => void;
  isGenerateDisabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGenerate, isGenerating, onClear, isOutputCollapsed, onToggleOutput, isGenerateDisabled }) => {
  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between z-20">
      <style>{`
        @keyframes glow {
            0% { box-shadow: 0 0 4px #60a5fa, 0 0 8px #60a5fa; }
            50% { box-shadow: 0 0 16px #3b82f6, 0 0 24px #3b82f6; }
            100% { box-shadow: 0 0 4px #60a5fa, 0 0 8px #60a5fa; }
        }
        .glowing-button {
            animation: glow 2s infinite ease-in-out;
        }
      `}</style>
      <h1 className="text-xl font-bold text-gray-800">CodePaint</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-2"
        >
          <ClearIcon className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={onGenerate}
          disabled={isGenerating || isGenerateDisabled}
          className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center
            ${isGenerating ? 'bg-blue-600 glowing-button' : 'bg-blue-500 hover:bg-blue-600'}`}
          title={isGenerateDisabled ? "Generation is disabled while an image is attached in chat" : ""}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate with Gemini'
          )}
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button
            onClick={onToggleOutput}
            aria-label={isOutputCollapsed ? 'Show output panel' : 'Hide output panel'}
            className={`p-2 rounded-md transition-colors ${
                isOutputCollapsed ? 'text-gray-500 hover:bg-gray-100' : 'bg-gray-100 text-blue-500'
            }`}
        >
            <PanelRightIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};