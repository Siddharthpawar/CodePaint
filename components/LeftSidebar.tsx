import React from 'react';
import { Tool } from '../types';
import { PencilIcon, RectangleIcon, EllipseIcon, ArrowIcon, TextIcon, LineIcon, EraserIcon } from '../constants';

interface LeftSidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const ToolButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`}
    >
        {icon}
    </button>
);

const tools = [
    { tool: Tool.PENCIL, label: 'Pencil', icon: <PencilIcon className="w-5 h-5" /> },
    { tool: Tool.LINE, label: 'Line', icon: <LineIcon className="w-5 h-5" /> },
    { tool: Tool.RECTANGLE, label: 'Rectangle', icon: <RectangleIcon className="w-5 h-5" /> },
    { tool: Tool.ELLIPSE, label: 'Ellipse', icon: <EllipseIcon className="w-5 h-5" /> },
    { tool: Tool.ARROW, label: 'Arrow', icon: <ArrowIcon className="w-5 h-5" /> },
    { tool: Tool.TEXT, label: 'Text', icon: <TextIcon className="w-5 h-5" /> },
    { tool: Tool.ERASER, label: 'Eraser', icon: <EraserIcon className="w-5 h-5" /> },
]

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <aside className="w-16 bg-white border-r border-gray-200 p-2 flex flex-col items-center gap-2">
      {tools.map(({tool, label, icon}) => (
        <ToolButton 
            key={tool}
            label={label} 
            icon={icon} 
            isActive={activeTool === tool} 
            onClick={() => setActiveTool(tool)} 
        />
      ))}
    </aside>
  );
};