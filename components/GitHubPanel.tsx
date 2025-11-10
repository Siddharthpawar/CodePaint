import React, { useState, useEffect, useCallback } from 'react';
import { FileTreeNode } from '../types';
import { fileSystemService } from '../services/githubService';
import { FileSystemFileHandle } from 'native-file-system-adapter';

interface FilePanelProps {
  isFolderOpen: boolean;
  folderName: string;
  onFolderOpen: (name: string, tree: FileTreeNode[]) => void;
  onFolderClose: () => void;
  onFileOpen: (content: string) => void;
}

const OpenFolderPrompt: React.FC<{ onFolderOpen: (name: string, tree: FileTreeNode[]) => void }> = ({ onFolderOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenFolder = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { handle, tree } = await fileSystemService.openFolder();
      onFolderOpen(handle.name, tree);
    } catch (err) {
      if (err) { // To handle user cancellation which rejects with null
        setError(err instanceof Error ? err.message : 'Failed to open folder.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800">Open a Local Folder</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Browse and edit files from your computer to use their content as context for generation. Changes will be saved to your local disk.
      </p>
      <div className="space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleOpenFolder}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? 'Opening...' : 'Open Folder'}
        </button>
      </div>
    </div>
  );
};

const FileTree: React.FC<{ 
    nodes: FileTreeNode[]; 
    onFileClick: (handle: FileSystemFileHandle, path: string) => void;
    activeFilePath: string | null;
}> = ({ nodes, onFileClick, activeFilePath }) => {
    const renderNode = (node: FileTreeNode) => {
        const [isExpanded, setIsExpanded] = useState(true);

        if (node.type === 'directory') {
            return (
                <div key={node.path}>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1 rounded">
                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        <span className="font-medium text-gray-700">{node.name}</span>
                    </button>
                    {isExpanded && <div className="pl-4 border-l border-gray-200 ml-2">
                        {node.children?.map(child => renderNode(child))}
                    </div>}
                </div>
            );
        }

        return (
            <button key={node.path} onClick={() => onFileClick(node.handle as FileSystemFileHandle, node.path)} className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded text-sm ${activeFilePath === node.path ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                <span className="font-mono text-gray-600">{node.name}</span>
            </button>
        );
    };

    return <div className="space-y-1">{nodes.map(node => renderNode(node))}</div>;
};

export const FilePanel: React.FC<FilePanelProps> = ({ isFolderOpen, folderName, onFolderOpen, onFolderClose, onFileOpen }) => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [activeFile, setActiveFile] = useState<{ path: string; content: string; handle: FileSystemFileHandle } | null>(null);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleFolderOpen = (name: string, tree: FileTreeNode[]) => {
    setFileTree(tree);
    onFolderOpen(name, tree);
  };
  
  useEffect(() => {
    if (!isFolderOpen) {
        setFileTree([]);
        setActiveFile(null);
        setEditedContent(null);
    }
  }, [isFolderOpen]);

  const handleFileClick = useCallback(async (handle: FileSystemFileHandle, path: string) => {
    setIsLoading(true);
    setError('');
    try {
      const content = await fileSystemService.getFileContent(handle);
      setActiveFile({ path, content, handle });
      setEditedContent(content);
      onFileOpen(content);
    } catch (err) {
      setError('Failed to fetch file content.');
      setActiveFile(null);
      setEditedContent(null);
      onFileOpen('');
    } finally {
      setIsLoading(false);
    }
  }, [onFileOpen]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    onFileOpen(newContent);
  };

  const handleSaveChanges = async () => {
    if (!activeFile || editedContent === null) return;
    setIsSaving(true);
    setError('');
    try {
        await fileSystemService.saveFileContent(activeFile.handle, editedContent);
        setActiveFile(prev => prev ? { ...prev, content: editedContent } : null);
    } catch (err) {
        setError("Failed to save changes.");
    } finally {
        setIsSaving(false);
    }
  };


  if (!isFolderOpen) {
    return <OpenFolderPrompt onFolderOpen={handleFolderOpen} />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      <div className="flex-shrink-0 p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">File Explorer</h3>
            <button onClick={onFolderClose} className="text-xs text-red-500 hover:underline">Close Folder</button>
        </div>
        <p className="text-xs text-gray-500 truncate">{folderName}</p>
      </div>

      <div className="flex-grow p-3 overflow-y-auto">
        {isLoading && !activeFile ? <p>Loading files...</p> : <FileTree nodes={fileTree} onFileClick={handleFileClick} activeFilePath={activeFile?.path || null}/>}
      </div>

      {activeFile && (
        <div className="flex-shrink-0 flex flex-col border-t border-gray-200 h-1/2">
            <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
                <p className="text-sm font-mono font-medium">{activeFile.path}</p>
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || editedContent === activeFile.content}
                    className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            <textarea
                value={editedContent ?? ''}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full p-2 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-200"
                spellCheck="false"
            />
        </div>
      )}
      {error && <p className="p-2 text-xs text-red-600 bg-red-100">{error}</p>}
    </div>
  );
};
