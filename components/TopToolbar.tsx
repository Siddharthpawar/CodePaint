import React from 'react';
import { GenerationMode } from '../types';

interface TopToolbarProps {
  color: string;
  setColor: (color: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  uiFramework: string;
  setUiFramework: (framework: string) => void;
}

const Select: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    ariaLabel: string;
}> = ({ value, onChange, children, ariaLabel }) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className="h-9 px-3 pr-8 text-sm text-gray-800 bg-white border border-gray-300 rounded-md cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={ariaLabel}
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);

export const TopToolbar: React.FC<TopToolbarProps> = ({
  color,
  setColor,
  language,
  setLanguage,
  generationMode,
  setGenerationMode,
  uiFramework,
  setUiFramework,
}) => {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-4 z-10">
        <div className="flex items-center gap-2">
            <label htmlFor="color-picker" className="text-sm font-medium text-gray-500">Color:</label>
            <input
                id="color-picker"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 p-0.5 bg-white border border-gray-300 rounded-md cursor-pointer"
            />
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-500">Mode:</label>
            <Select
                value={generationMode}
                onChange={(e) => setGenerationMode(e.target.value as GenerationMode)}
                ariaLabel="Select generation mode"
            >
                <option value={GenerationMode.CODE_LOGIC}>Code Logic</option>
                <option value={GenerationMode.UI_COMPONENT}>UI Component</option>
            </Select>
        </div>
        
        {generationMode === GenerationMode.CODE_LOGIC ? (
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-500">Language:</label>
                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    ariaLabel="Select code language"
                >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Pseudocode">Pseudocode</option>
                </Select>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-500">Framework:</label>
                <Select
                    value={uiFramework}
                    onChange={(e) => setUiFramework(e.target.value)}
                    ariaLabel="Select UI framework"
                >
                    <option value="React">React</option>
                    <option value="Vue">Vue</option>
                    <option value="Svelte">Svelte</option>
                    <option value="HTML/CSS">HTML/CSS</option>
                </Select>
            </div>
        )}
    </div>
  );
};