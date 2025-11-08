import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, GenerationMode } from '../types';
import { ChatInput } from './ChatInput';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string, image?: { base64: string; mimeType: string; }) => void;
  onImageAttach: () => void;
  onImageRemove: () => void;
}

const useTypingEffect = (text: string, enabled: boolean, speed: number = 10) => {
    const [displayedText, setDisplayedText] = useState('');
  
    useEffect(() => {
      if (!text) {
        setDisplayedText('');
        return;
      }

      if (!enabled) {
        setDisplayedText(text);
        return;
      }
  
      setDisplayedText(''); 
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => text.slice(0, prev.length + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
  
      return () => {
        clearInterval(typingInterval);
      };
    }, [text, speed, enabled]);
  
    return displayedText;
  };

const CodeBlock: React.FC<{ code: string, isTyping: boolean }> = ({ code, isTyping }) => {
    const [copied, setCopied] = useState(false);
    const animatedCode = useTypingEffect(code, isTyping);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden relative">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-700 text-gray-300 px-2 py-1 text-xs font-semibold rounded hover:bg-gray-600 transition-colors z-10"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="p-4 text-sm overflow-auto">
                <code className="language-tsx text-gray-200 whitespace-pre-wrap">
                    {animatedCode}
                </code>
            </pre>
        </div>
    );
};

const ModelMessage: React.FC<{ message: ChatMessage, isLastMessage: boolean }> = ({ message, isLastMessage }) => {
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const cleanOutput = message.content.replace(/^```(?:\w+)?\s*|```\s*$/g, '').trim();

    useEffect(() => {
        if (message.generationMode === GenerationMode.UI_COMPONENT) {
            setActiveTab('preview');
        } else {
            setActiveTab('code');
        }
    }, [message]);

    const TabButton: React.FC<{label: string, tabName: 'code' | 'preview'}> = ({label, tabName}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors
                ${activeTab === tabName ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'}
            `}
        >
            {label}
        </button>
    )

    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {message.generationMode === GenerationMode.UI_COMPONENT && (
                <div className="flex gap-2 border-b border-gray-200 pb-2">
                    <TabButton label="Preview" tabName="preview" />
                    <TabButton label="Code" tabName="code" />
                </div>
            )}
            
            {activeTab === 'code' ? (
                <CodeBlock code={cleanOutput} isTyping={isLastMessage} />
            ) : (
                <iframe
                    srcDoc={cleanOutput}
                    title="UI Preview"
                    className="w-full h-64 bg-white rounded-md border border-gray-200"
                    sandbox="allow-scripts"
                />
            )}
        </div>
    );
}

const UserMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    return (
        <div className="bg-blue-500 text-white rounded-lg p-3">
            {message.image && (
                <img 
                    src={`data:${message.image.mimeType};base64,${message.image.base64}`} 
                    alt="User upload" 
                    className="rounded-md mb-2 max-h-48 w-auto"
                />
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
    );
};


export const OutputDisplay: React.FC<ChatPanelProps> = ({ chatHistory, isLoading, error, onSendMessage, onImageAttach, onImageRemove }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);
    
    return (
        <div className="bg-white h-full flex flex-col border border-gray-200 rounded-lg">
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-gray-200">
                 <h2 className="text-base font-semibold text-gray-800">Chat</h2>
            </div>
            <div className="flex-grow min-h-0 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                {chatHistory.length === 0 && !isLoading && !error && (
                    <div className="flex items-center justify-center h-full text-gray-500 text-center">
                        <p>Draw on the canvas and click "Generate" or attach an image to start.</p>
                    </div>
                )}
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xl">
                            {msg.role === 'user' 
                                ? <UserMessage message={msg} /> 
                                : <ModelMessage message={msg} isLastMessage={index === chatHistory.length - 1 && !isLoading} />}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center text-gray-500">
                            <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Thinking...</span>
                        </div>
                    </div>
                )}
                {error && <div className="p-3 my-2 text-red-700 bg-red-100 rounded-md">{error}</div>}
                <div ref={messagesEndRef} />
            </div>
            <ChatInput 
              onSendMessage={onSendMessage} 
              isLoading={isLoading} 
              onImageAttach={onImageAttach} 
              onImageRemove={onImageRemove} 
            />
        </div>
    );
};