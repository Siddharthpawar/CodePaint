import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Tool, Point, DrawingObject, PencilDrawing, ShapeDrawing, TextDrawing } from '../types';

interface CanvasComponentProps {
  tool: Tool;
  color: string;
  lineWidth: number;
  scale: number;
  panOffset: Point;
  isPanning: boolean;
  onDrawingChange: (objects: DrawingObject[]) => void;
  drawingObjects: DrawingObject[];
}

export interface CanvasRef {
  clear: () => void;
  exportToImage: () => { data: string; mimeType: 'image/png' } | null;
}

const CanvasComponent = forwardRef<CanvasRef, CanvasComponentProps>(({ tool, color, lineWidth, scale, panOffset, isPanning, onDrawingChange, drawingObjects }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingObject | null>(null);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const majorGridSize = 100;
    const minorGridSize = 20;
    
    const majorGridColor = '#d1d5db'; // gray-300
    const minorGridColor = '#e5e7eb'; // gray-200
    
    const scaledMajorGridSize = majorGridSize * scale;
    const scaledMinorGridSize = minorGridSize * scale;
    
    // Determine minor grid visibility and opacity
    let minorGridOpacity = 0;
    const minorGridThresholdMin = 5;
    const minorGridThresholdMax = 15;
    if (scaledMinorGridSize > minorGridThresholdMin) {
        minorGridOpacity = Math.min(1, (scaledMinorGridSize - minorGridThresholdMin) / (minorGridThresholdMax - minorGridThresholdMin));
    }
    
    const startX = -panOffset.x / scale;
    const startY = -panOffset.y / scale;
    const endX = (width / dpr - panOffset.x) / scale;
    const endY = (height / dpr - panOffset.y) / scale;

    ctx.save();
    ctx.translate(panOffset.x * dpr, panOffset.y * dpr);
    ctx.scale(scale * dpr, scale * dpr);

    // Draw minor grid lines if visible
    if (minorGridOpacity > 0) {
        ctx.beginPath();
        ctx.strokeStyle = minorGridColor;
        ctx.globalAlpha = minorGridOpacity;
        ctx.lineWidth = 1 / (scale * dpr);

        const minorStartX = Math.floor(startX / minorGridSize) * minorGridSize;
        const minorStartY = Math.floor(startY / minorGridSize) * minorGridSize;

        for (let x = minorStartX; x < endX; x += minorGridSize) {
            if (x % majorGridSize !== 0) {
                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
            }
        }
        for (let y = minorStartY; y < endY; y += minorGridSize) {
            if (y % majorGridSize !== 0) {
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
            }
        }
        ctx.stroke();
    }
    
    // Draw major grid lines
    ctx.beginPath();
    ctx.strokeStyle = majorGridColor;
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1 / (scale * dpr);

    const majorStartX = Math.floor(startX / majorGridSize) * majorGridSize;
    const majorStartY = Math.floor(startY / majorGridSize) * majorGridSize;
    
    for (let x = majorStartX; x < endX; x += majorGridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = majorStartY; y < endY; y += majorGridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGrid(context, canvas.width, canvas.height, dpr);

    context.save();
    context.translate(panOffset.x * dpr, panOffset.y * dpr);
    context.scale(scale * dpr, scale * dpr);

    [...drawingObjects, currentDrawing].forEach(obj => {
      if (!obj) return;
      drawObject(context, obj);
    });

    context.restore();
  }, [drawingObjects, currentDrawing, panOffset, scale]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      onDrawingChange([]);
    },
    exportToImage: () => {
        if (drawingObjects.length === 0) return null;
        const canvas = canvasRef.current;
        if (!canvas) return null;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        drawingObjects.forEach(obj => {
            const { minX: objMinX, minY: objMinY, maxX: objMaxX, maxY: objMaxY } = getObjectBounds(obj);
            minX = Math.min(minX, objMinX);
            minY = Math.min(minY, objMinY);
            maxX = Math.max(maxX, objMaxX);
            maxY = Math.max(maxY, objMaxY);
        });

        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        const width = maxX - minX;
        const height = maxY - minY;

        if (width <= 0 || height <= 0) return null;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return null;
        
        tempCtx.fillStyle = '#ffffff'; // Match light background
        tempCtx.fillRect(0, 0, width, height);

        tempCtx.translate(-minX, -minY);
        drawingObjects.forEach(obj => {
            drawObject(tempCtx, obj, true);
        });
        
        const dataUrl = tempCanvas.toDataURL('image/png');
        return { data: dataUrl.split(',')[1], mimeType: 'image/png' };
    },
  }));

  const getMousePos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / scale;
    const y = (e.clientY - rect.top - panOffset.y) / scale;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (e.button !== 0 || isPanning) return;
    const pos = getMousePos(e);

    // Text tool is a single-click action, handle it separately.
    if (tool === Tool.TEXT) {
        const text = window.prompt("Enter text:");
        if (text && text.trim() !== '') {
            const newTextObject: TextDrawing = {
                id: new Date().toISOString(),
                tool: Tool.TEXT,
                color,
                lineWidth, // Not used for text, but part of base type
                position: pos,
                text: text,
                fontSize: 16,
            };
            onDrawingChange([...drawingObjects, newTextObject]);
        }
        return; // End here for text tool, do not set isDrawing
    }

    // For all other tools, which are drag-based
    setIsDrawing(true);
    
    const baseProps = {
        id: new Date().toISOString(),
        color,
        lineWidth,
    };

    if (tool === Tool.PENCIL || tool === Tool.ERASER) {
        setCurrentDrawing({ ...baseProps, tool, points: [pos] } as PencilDrawing);
    } else { // Rectangle, Ellipse, Arrow, Line
        setCurrentDrawing({ ...baseProps, tool, start: pos, end: pos } as ShapeDrawing);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || isPanning || !currentDrawing) return;
    const pos = getMousePos(e);

    if (currentDrawing.tool === Tool.PENCIL || currentDrawing.tool === Tool.ERASER) {
        setCurrentDrawing({ ...currentDrawing, points: [...(currentDrawing as PencilDrawing).points, pos] });
    } else if ('end' in currentDrawing) {
        setCurrentDrawing({ ...currentDrawing, end: pos });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentDrawing) return;
    setIsDrawing(false);
    if(currentDrawing.tool !== Tool.TEXT) {
        onDrawingChange([...drawingObjects, currentDrawing]);
    }
    setCurrentDrawing(null);
  };
  
  const getObjectBounds = (obj: DrawingObject) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const lw = obj.lineWidth;
    
    switch (obj.tool) {
      case Tool.PENCIL:
      case Tool.ERASER:
        obj.points.forEach(p => {
          minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
        });
        break;
      case Tool.TEXT:
        // A simple approximation for bounding box of text
        const approxCharWidth = obj.fontSize / 1.5;
        minX = obj.position.x;
        minY = obj.position.y - obj.fontSize;
        maxX = obj.position.x + obj.text.length * approxCharWidth;
        maxY = obj.position.y;
        break;
      case Tool.RECTANGLE:
      case Tool.ELLIPSE:
      case Tool.ARROW:
      case Tool.LINE:
        minX = Math.min(obj.start.x, obj.end.x);
        minY = Math.min(obj.start.y, obj.end.y);
        maxX = Math.max(obj.start.x, obj.end.x);
        maxY = Math.max(obj.start.y, obj.end.y);
        break;
    }
    return { minX: minX - lw, minY: minY - lw, maxX: maxX + lw, maxY: maxY + lw };
  };

  const drawObject = (ctx: CanvasRenderingContext2D, obj: DrawingObject, forExport: boolean = false) => {
    ctx.strokeStyle = obj.color;
    ctx.fillStyle = obj.color;
    const effectiveLineWidth = forExport ? obj.lineWidth : obj.lineWidth / scale;

    if (obj.tool === Tool.ERASER) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = (forExport ? obj.lineWidth * 5 : (obj.lineWidth * 5) / scale);
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = effectiveLineWidth;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    switch(obj.tool) {
        case Tool.PENCIL:
        case Tool.ERASER:
            if (obj.points.length < 2) break;
            ctx.moveTo(obj.points[0].x, obj.points[0].y);
            for(let i=1; i < obj.points.length; i++) {
                ctx.lineTo(obj.points[i].x, obj.points[i].y);
            }
            break;
        case Tool.RECTANGLE:
            ctx.rect(obj.start.x, obj.start.y, obj.end.x - obj.start.x, obj.end.y - obj.start.y);
            break;
        case Tool.LINE:
            ctx.moveTo(obj.start.x, obj.start.y);
            ctx.lineTo(obj.end.x, obj.end.y);
            break;
        case Tool.ELLIPSE:
            const centerX = obj.start.x + (obj.end.x - obj.start.x) / 2;
            const centerY = obj.start.y + (obj.end.y - obj.start.y) / 2;
            const radiusX = Math.abs((obj.end.x - obj.start.x) / 2);
            const radiusY = Math.abs((obj.end.y - obj.start.y) / 2);
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            break;
        case Tool.ARROW:
            const headlen = 10 / scale;
            const angle = Math.atan2(obj.end.y - obj.start.y, obj.end.x - obj.start.x);
            ctx.moveTo(obj.start.x, obj.start.y);
            ctx.lineTo(obj.end.x, obj.end.y);
            ctx.lineTo(obj.end.x - headlen * Math.cos(angle - Math.PI / 6), obj.end.y - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(obj.end.x, obj.end.y);
            ctx.lineTo(obj.end.x - headlen * Math.cos(angle + Math.PI / 6), obj.end.y - headlen * Math.sin(angle + Math.PI / 6));
            break;
        case Tool.TEXT:
            const fontSize = forExport ? obj.fontSize : obj.fontSize / scale;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText(obj.text, obj.position.x, obj.position.y);
            break;
    }
    if (obj.tool !== Tool.TEXT) {
        ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      className="w-full h-full"
      style={{ 
        touchAction: 'none',
      }}
    />
  );
});

export default CanvasComponent;