import { FileTreeNode } from '../types';
import { FileSystemDirectoryHandle, FileSystemFileHandle } from 'native-file-system-adapter';

// This service now uses the File System Access API for local files.

const buildFileTree = async (directoryHandle: FileSystemDirectoryHandle, path: string = ''): Promise<FileTreeNode[]> => {
  const tree: FileTreeNode[] = [];
  // @ts-ignore
  for await (const entry of directoryHandle.values()) {
    const newPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      tree.push({
        path: newPath,
        name: entry.name,
        type: 'file',
        handle: entry,
      });
    } else if (entry.kind === 'directory') {
      tree.push({
        path: newPath,
        name: entry.name,
        type: 'directory',
        handle: entry,
        // Fix: Explicitly cast `entry` to FileSystemDirectoryHandle to resolve a type inference issue.
        children: await buildFileTree(entry as FileSystemDirectoryHandle, newPath),
      });
    }
  }
  return tree.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
};


export const fileSystemService = {
  async openFolder(): Promise<{ handle: FileSystemDirectoryHandle; tree: FileTreeNode[] }> {
    try {
      // @ts-ignore
      const directoryHandle = await window.showDirectoryPicker();
      const tree = await buildFileTree(directoryHandle);
      return { handle: directoryHandle, tree };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('User cancelled the folder picker.');
        return Promise.reject(null);
      }
      console.error('Error opening directory:', error);
      throw new Error('Could not open directory. Please ensure your browser supports the File System Access API.');
    }
  },

  async getFileContent(fileHandle: FileSystemFileHandle): Promise<string> {
    const file = await fileHandle.getFile();
    return file.text();
  },

  async saveFileContent(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
};