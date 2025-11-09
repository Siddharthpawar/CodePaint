import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Tool, GenerationMode, DrawingObject, Point, ChatMessage, CanvasPage } from './types';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { TopToolbar } from './components/TopToolbar';
import CanvasComponent, { CanvasRef } from './components/CanvasComponent';
import { OutputDisplay } from './components/OutputDisplay';
import { generateContent } from './services/geminiService';
import { getCodeLogicInstruction, getUIComponentInstruction, getFollowUpInstruction, ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './constants';
import { CanvasTabs } from './components/CanvasTabs';

function App() {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.PENCIL);
  const [color, setColor] = useState<string>('#000000');
  const [lineWidth] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.CODE_LOGIC);
  const [language, setLanguage] = useState<string>('JavaScript');
  const [uiFramework, setUiFramework] = useState<string>('React');

  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  const [pages, setPages] = useState<CanvasPage[]>([
    { id: `page-${Date.now()}`, name: 'Page 1', objects: [] }
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  
  const [isImageAttached, setIsImageAttached] = useState(false);

  const canvasComponentRef = useRef<CanvasRef>(null);
  const mainContainerRef = useRef<HTMLElement>(null);

  const handleDrawingChange = useCallback((newObjects: DrawingObject[]) => {
    setPages(currentPages => {
      const newPages = [...currentPages];
      if (newPages[activePageIndex]) {
        newPages[activePageIndex] = {
          ...newPages[activePageIndex],
          objects: newObjects,
        };
      }
      return newPages;
    });
  }, [activePageIndex]);

  const handleClearCanvas = useCallback(() => {
    handleDrawingChange([]);
    setChatHistory([]);
    setError(null);
    setIsImageAttached(false);
  }, [handleDrawingChange]);

  const handleGenerate = useCallback(async () => {
    if (isImageAttached) return; // Should be disabled, but as a safeguard
    if (isOutputCollapsed) {
        setIsOutputCollapsed(false);
    }
    const imageExport = canvasComponentRef.current?.exportToImage();
    if (!imageExport) {
      setError("There is nothing on the canvas to generate from.");
      return;
    }

    setIsLoading(true);
    setChatHistory([]);
    setError(null);

    try {
      const { data: base64ImageData, mimeType } = imageExport;
            
      const prompt = generationMode === GenerationMode.CODE_LOGIC
        ? getCodeLogicInstruction(language)
        : getUIComponentInstruction(uiFramework);
      
      const images = [{ data: base64ImageData, mimeType: mimeType }];
      const result = await generateContent(prompt, images);
      
      setChatHistory([{ role: 'model', content: result, generationMode }]);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate content: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [language, generationMode, uiFramework, pages, activePageIndex, isOutputCollapsed, isImageAttached]);
  
  const handleSendMessage = useCallback(async (message: string, image?: { base64: string, mimeType: string }) => {
    // If an image is attached, it's a new primary generation, not a follow-up.
    if (image) {
      if (isOutputCollapsed) {
        setIsOutputCollapsed(false);
      }
      
      const userMessage: ChatMessage = { role: 'user', content: message, image };
      setChatHistory([userMessage]); // Start a new chat session.
      setIsLoading(true);
      setError(null);

      try {
        const prompt = generationMode === GenerationMode.CODE_LOGIC
          ? getCodeLogicInstruction(language)
          : getUIComponentInstruction(uiFramework);
        
        const imagesToGemini = [{ data: image.base64, mimeType: image.mimeType }];
        const result = await generateContent(prompt, imagesToGemini);
        
        setChatHistory([userMessage, { role: 'model', content: result, generationMode }]);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate content: ${errorMessage}`);
        console.error(e);
      } finally {
        setIsLoading(false);
        setIsImageAttached(false); // Reset focus to canvas after generation
      }
      return;
    }
    
    // Standard follow-up logic if no image is attached
    const lastModelMessage = [...chatHistory].reverse().find(m => m.role === 'model');
    if (!lastModelMessage) {
        setError("Cannot send a follow-up without an initial generation.");
        return;
    }

    setIsLoading(true);
    setError(null);
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);
    
    try {
        const previousCode = lastModelMessage?.content || "No previous code available.";
        const prompt = getFollowUpInstruction(previousCode, message);
        
        const result = await generateContent(prompt, []);

        setChatHistory([...newHistory, { role: 'model', content: result, generationMode: lastModelMessage?.generationMode || GenerationMode.CODE_LOGIC }]);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate content: ${errorMessage}`);
        console.error(e);
    } finally {
        setIsLoading(false);
    }

  }, [chatHistory, generationMode, language, uiFramework, isOutputCollapsed]);


  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!mainContainerRef.current || isImageAttached) return;

    const rect = mainContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.1;
    const oldScale = scale;
    const newScale = e.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
    
    const minScale = 0.05;
    const maxScale = 50;
    const clampedScale = Math.max(minScale, Math.min(newScale, maxScale));

    if (clampedScale === oldScale) return;
    
    const newPanX = mouseX - ((mouseX - panOffset.x) / oldScale) * clampedScale;
    const newPanY = mouseY - ((mouseY - panOffset.y) / oldScale) * clampedScale;

    setScale(clampedScale);
    setPanOffset({ x: newPanX, y: newPanY });
  };


  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && isSpacePressed && !isImageAttached) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Do not activate panning if the user is typing in an input field.
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetTransform = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
    if (!mainContainerRef.current) return;
    const rect = mainContainerRef.current.getBoundingClientRect();
    const mouseX = rect.left + rect.width / 2;
    const mouseY = rect.top + rect.height / 2;
    
    const zoomFactor = 1.2;
    const oldScale = scale;
    const newScale = direction === 'in' ? oldScale * zoomFactor : oldScale / zoomFactor;
    const clampedScale = Math.max(0.05, Math.min(newScale, 50));
    
    const newPanX = mouseX - ((mouseX - panOffset.x) / oldScale) * clampedScale;
    const newPanY = mouseY - ((mouseY - panOffset.y) / oldScale) * clampedScale;

    setScale(clampedScale);
    setPanOffset({ x: newPanX, y: newPanY });
  }

  const handleAddPage = () => {
    const newPageNumber = pages.length + 1;
    const newPage: CanvasPage = {
      id: `page-${Date.now()}`,
      name: `Page ${newPageNumber}`,
      objects: [],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length); // Switch to the new page
  };

  const handleSelectPage = (index: number) => {
    setActivePageIndex(index);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 font-sans overflow-hidden">
      <Header
        onGenerate={handleGenerate}
        isGenerating={isLoading && chatHistory.length === 0}
        onClear={handleClearCanvas}
        isOutputCollapsed={isOutputCollapsed}
        onToggleOutput={() => setIsOutputCollapsed(!isOutputCollapsed)}
        isGenerateDisabled={isImageAttached || isLoading}
      />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <TopToolbar
            color={color}
            setColor={setColor}
            language={language}
            setLanguage={setLanguage}
            generationMode={generationMode}
            setGenerationMode={setGenerationMode}
            uiFramework={uiFramework}
            setUiFramework={setUiFramework}
          />
          <CanvasTabs
            pages={pages}
            activePageIndex={activePageIndex}
            onSelectPage={handleSelectPage}
            onAddPage={handleAddPage}
          />
          <main 
            ref={mainContainerRef}
            className="flex-1 relative bg-gray-100"
            style={{ cursor: isPanning ? 'grabbing' : isSpacePressed ? 'grab' : 'crosshair' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className={`w-full h-full transition-all duration-300 ${isImageAttached ? 'filter blur-sm pointer-events-none' : ''}`}>
                <CanvasComponent
                    ref={canvasComponentRef}
                    tool={activeTool}
                    color={color}
                    lineWidth={lineWidth}
                    scale={scale}
                    panOffset={panOffset}
                    isPanning={isPanning}
                    drawingObjects={pages[activePageIndex]?.objects || []}
                    onDrawingChange={handleDrawingChange}
                />
            </div>
            {isImageAttached && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center border border-gray-200">
                        <h3 className="font-semibold text-gray-800 text-lg">Source Updated</h3>
                        <p className="text-sm text-gray-600 mt-1">Ready to generate from the attached image.</p>
                    </div>
                </div>
            )}
            <div className="absolute bottom-4 right-4 bg-white p-1 rounded-lg shadow-md border border-gray-200 flex items-center gap-1">
                <button onClick={() => handleZoom('out')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><ZoomOutIcon className="w-5 h-5"/></button>
                <button onClick={resetTransform} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><ResetZoomIcon className="w-5 h-5"/></button>
                <button onClick={() => handleZoom('in')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><ZoomInIcon className="w-5 h-5"/></button>
                <span className="text-sm font-medium text-gray-700 w-16 text-center">{Math.round(scale * 100)}%</span>
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-3 py-1 text-xs text-gray-700 rounded-full pointer-events-none border border-gray-200/50">
                Hold <kbd className="font-sans bg-gray-200 px-1.5 py-0.5 rounded">Space</kbd> + Drag to Pan, Scroll to Zoom
            </div>
          </main>
        </div>
        <div className={`
            relative transition-all duration-300 ease-in-out flex-shrink-0 
            bg-white border-l border-gray-200
            ${isOutputCollapsed ? 'w-0 border-l-0' : 'w-[35%] max-w-[600px]'}
        `}>
            <div className={`h-full w-full p-2 overflow-hidden transition-opacity duration-200 ${isOutputCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <OutputDisplay
                    chatHistory={chatHistory}
                    isLoading={isLoading}
                    error={error}
                    onSendMessage={handleSendMessage}
                    onImageAttach={() => {
                        setIsImageAttached(true);
                        setChatHistory([]);
                        setError(null);
                    }}
                    onImageRemove={() => setIsImageAttached(false)}
                />
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;