export enum Tool {
  PENCIL = 'PENCIL',
  RECTANGLE = 'RECTANGLE',
  ELLIPSE = 'ELLIPSE',
  ARROW = 'ARROW',
  TEXT = 'TEXT',
  LINE = 'LINE',
  ERASER = 'ERASER',
}

export enum GenerationMode {
  CODE_LOGIC = 'CODE_LOGIC',
  UI_COMPONENT = 'UI_COMPONENT',
}

export type Point = {
  x: number;
  y: number;
};

// --- New Drawing Object Types ---

interface BaseDrawing {
  id: string;
  tool: Tool;
  color: string;
  lineWidth: number;
}

export interface PencilDrawing extends BaseDrawing {
  tool: Tool.PENCIL | Tool.ERASER;
  points: Point[];
}

export interface ShapeDrawing extends BaseDrawing {
  tool: Tool.RECTANGLE | Tool.ELLIPSE | Tool.ARROW | Tool.LINE;
  start: Point;
  end: Point;
}

export interface TextDrawing extends BaseDrawing {
  tool: Tool.TEXT;
  start: Point;
  end: Point;
  text: string;
  fontSize: number;
}

export type DrawingObject = PencilDrawing | ShapeDrawing | TextDrawing;

// --- New Canvas Page Type ---
export type CanvasPage = {
  id: string;
  name: string;
  objects: DrawingObject[];
};

// --- New Chat Types ---

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  generationMode?: GenerationMode;
};