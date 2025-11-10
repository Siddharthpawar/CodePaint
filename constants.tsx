import React from 'react';

export const getCodeLogicInstruction = (language: string, fileContent?: string) => `You are an expert programmer and logic interpreter.
Analyze the user-drawn diagram, flowchart, or state machine.
The user has also provided the content of a file from their repository for context.

CONTEXT FILE CONTENT:
---
${fileContent || "No file content provided."}
---

Your main task is to interpret the logical flow, conditions, and actions from the diagram and translate it into a concise and functional code snippet in the ${language} programming language.
If the user's request seems to reference the file content (e.g., asking to add or modify a function), use the diagram as a guide to implement that change within the context of the file.
The output must be ONLY the code, enclosed in a single markdown block. Do not include any explanatory text before or after the code block.
Focus on implementing the underlying logic, not on visually recreating the diagram.`;

export const getUIComponentInstruction = (framework: string, fileContent?: string) => `You are an expert frontend developer specializing in ${framework}.
Analyze the user-drawn wireframe or diagram.
The user has also provided the content of a file from their repository for context.

CONTEXT FILE CONTENT:
---
${fileContent || "No file content provided."}
---

Your main task is to convert the visual elements from the diagram into a functional, self-contained UI component using ${framework}.
If the user's request seems to reference the file content, use the diagram as a guide to modify the existing code.
To facilitate a live preview, please ensure the final output is a single, self-contained HTML file.
- For 'HTML/CSS', this is straightforward.
- For frameworks like 'React', 'Vue', or 'Svelte', use a script tag to pull the framework from a CDN (e.g., unpkg) and include the component code within a script tag in the HTML body. The component should be immediately rendered to the page.
The output must be ONLY the code for this single HTML file, enclosed in a single markdown block. Do not include any explanatory text before or after the code block.
Make reasonable assumptions about styling and structure to create a visually appealing and functional component that mirrors the drawing.`;

export const getFollowUpInstruction = (previousCode: string, userRequest: string, fileContent?: string) => `You are an expert programmer AI assistant.
The user has provided some existing code that was generated from a drawing or a previous request.
They have also provided the content of a file from their repository for context.
Now, the user has a follow-up request to modify or explain that code.
The user may also provide an image for context with their follow-up request. Analyze it if present.

CONTEXT FILE CONTENT:
---
${fileContent || "No file content provided."}
---

PREVIOUS CODE:
---
${previousCode}
---

USER REQUEST:
---
${userRequest}
---

Your task is to fulfill the user's request based on the previous code, the context file, and any new images.
- If they ask for a change, provide the full, updated code snippet.
- If they ask for an explanation, provide a clear and concise answer.
- If they ask to add comments, add the comments to the code.
The output must be ONLY the code or the explanation. For code, enclose it in a single markdown block. For explanations, use clean markdown. Do not include any other text.`;


export const PencilIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);

export const RectangleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  </svg>
);

export const EllipseIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

export const ArrowIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const LineIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="19" x2="19" y2="5"></line>
    </svg>
);

export const TextIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 7V4h16v3"></path>
    <path d="M9 20h6"></path><path d="M12 4v16"></path>
  </svg>
);

export const EraserIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z"/>
      <path d="M22 2 17.5 6.5"/>
    </svg>
);

export const ClearIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

export const ZoomInIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

export const ZoomOutIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

export const ResetZoomIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 2v6h6"></path>
    <path d="M21 12A9 9 0 0 0 6.49 4.36L2 9"></path>
    <path d="M21 22v-6h-6"></path>
    <path d="M3 12a9 9 0 0 0 14.51 7.64L22 15"></path>
  </svg>
);

export const PanelRightIcon: React.FC<{className?: string; isActive?: boolean}> = ({ className, isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M15 4v16"/>
    </svg>
);

export const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m22 2-7 20-4-9-9-4Z"/>
        <path d="M22 2 11 13"/>
    </svg>
);

export const AttachmentIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);

export const FolderIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
    </svg>
);
