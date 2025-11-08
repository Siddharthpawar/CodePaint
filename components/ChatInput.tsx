import React, { useState, useRef } from 'react';
import { SendIcon, AttachmentIcon } from '../constants';

interface ChatInputProps {
  onSendMessage: (message: string, image?: { base64: string; mimeType: string; }) => void;
  isLoading: boolean;
  onImageAttach: () => void;
  onImageRemove: () => void;
}

const fileToDataUrl = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onImageAttach, onImageRemove }) => {
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ preview: string; file: File } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedImage) && !isLoading) {
      let imagePayload;
      if (attachedImage) {
        imagePayload = await fileToDataUrl(attachedImage.file);
      }
      onSendMessage(message.trim(), imagePayload);
      setMessage('');
      setAttachedImage(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (attachedImage) {
        onImageRemove(); // Notify parent that image is gone after sending
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setAttachedImage({
            preview: URL.createObjectURL(file),
            file: file
        });
        onImageAttach();
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
      {attachedImage && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg relative w-fit">
              <img src={attachedImage.preview} alt="preview" className="max-h-24 rounded" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                aria-label="Remove image"
              >&times;</button>
          </div>
      )}
      <div className="relative flex items-center">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
          aria-label="Attach image"
        >
            <AttachmentIcon className="w-5 h-5" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={attachedImage ? "Describe what to generate from the image..." : "Ask a follow-up or attach an image..."}
          className="w-full bg-gray-100 text-gray-800 rounded-lg p-2 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (!message.trim() && !attachedImage)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};