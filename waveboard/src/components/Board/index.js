import { useContext, useEffect, useLayoutEffect, useRef,useState } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import { updateCanvas } from "../../utils/api";
import { drawElement } from "../../utils/draw";
import classes from "./index.module.css";

function Board({ isDarkMode }) {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const containerRef = useRef();

   const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const {
    activeToolItem,
    elements,
    toolActionType,
    viewport,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    boardWheelHandler,
    textAreaBlurHandler,
    undo,
    redo,
    panViewport,
    zoomViewport,
    resetViewport,
  } = useContext(boardContext);
  const { toolboxState } = useContext(toolboxContext);

  // Initialize canvas to full screen
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "z":
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            event.preventDefault();
            redo();
            break;
          case "0":
            event.preventDefault();
            resetViewport();
            break;
          case "=":
          case "+":
            event.preventDefault();
            zoomViewport(1.2, window.innerWidth / 2, window.innerHeight / 2);
            break;
          case "-":
            event.preventDefault();
            zoomViewport(0.8, window.innerWidth / 2, window.innerHeight / 2);
            break;
        }
      }
      
      // Arrow keys for panning
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
        const panDistance = 50;
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            panViewport(0, panDistance);
            break;
          case "ArrowDown":
            event.preventDefault();
            panViewport(0, -panDistance);
            break;
          case "ArrowLeft":
            event.preventDefault();
            panViewport(panDistance, 0);
            break;
          case "ArrowRight":
            event.preventDefault();
            panViewport(-panDistance, 0);
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, panViewport, zoomViewport, resetViewport]);

  // Render canvas with viewport transformation
useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // 1. Fill the background (screen space)
    context.fillStyle = isDarkMode ? '#1f2937' : '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the static grid (screen space)
    drawGrid(context, viewport, isDarkMode);

    // 3. Apply transformations for drawing elements (world space)
    context.save();
    context.translate(viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);

    const roughCanvas = rough.canvas(canvas);
    elements.forEach((element) => {
        drawElement({ roughCanvas, context, element });
    });

    // 4. Restore context to draw UI elements (screen space)
    context.restore();

    

   const isDrawingToolActive = [
        TOOL_ITEMS.BRUSH, TOOL_ITEMS.AI_BRUSH, TOOL_ITEMS.LINE, TOOL_ITEMS.RECTANGLE,
        TOOL_ITEMS.CIRCLE, TOOL_ITEMS.ARROW, TOOL_ITEMS.TRIANGLE, TOOL_ITEMS.DIAMOND
    ].includes(activeToolItem);

       if (isDrawingToolActive) {
        context.fillStyle = isDarkMode ? 'white' : 'black';
        context.beginPath();
        context.arc(cursorPosition.x, cursorPosition.y, 4, 0, 2 * Math.PI); // A small dot
        context.fill();
    }

    if (activeToolItem === TOOL_ITEMS.ERASER) {
      const radius = 15; 
      context.beginPath();
      context.arc(cursorPosition.x, cursorPosition.y, radius, 0, 2 * Math.PI);
      context.fill();
      context.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(cursorPosition.x, cursorPosition.y, radius, 0, 2 * Math.PI);
      context.stroke();
    }
  }, [elements, viewport, activeToolItem, cursorPosition, isDarkMode]);
  


  
  // Draw grid background
const drawGrid = (context, viewport, isDarkMode) => {
    const gridSize = 20; 
    const { width, height } = context.canvas;

    const offsetX = viewport.x % gridSize;
    const offsetY = viewport.y % gridSize;

    context.strokeStyle = isDarkMode ? '#4b5563' : '#d1d5db';
    context.lineWidth = 1;
    context.globalAlpha = 0.5;

    // Draw vertical lines
    for (let x = offsetX; x < width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    // Draw horizontal lines
    for (let y = offsetY; y < height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.globalAlpha = 1;
  };

  // Focus textarea when writing
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  // Get cursor style based on tool action type
  const getCursorStyle = () => {
     if (activeToolItem === TOOL_ITEMS.ERASER) {
      return 'none';
    }
    switch (toolActionType) {
      case TOOL_ACTION_TYPES.PANNING:
        return 'grabbing';
      case TOOL_ACTION_TYPES.WRITING:
        return 'text';
      default:
        return 'crosshair';
    }
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    boardMouseDownHandler(event, toolboxState);
  };

  const handleMouseMove = (event) => {
    setCursorPosition({ x: event.clientX, y: event.clientY }); 
    boardMouseMoveHandler(event);
  };

  const handleMouseUp = () => {
    boardMouseUpHandler();

   
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split("/");
    const extractedId = pathSegments.pop();
    
    console.log('Debug Canvas ID extraction:', {
        fullPath: currentPath,
        pathSegments: pathSegments,
        extractedId: extractedId,
        extractedIdType: typeof extractedId,
        extractedIdLength: extractedId?.length
    });
    
    if (!extractedId || extractedId === '') {
        console.error('No canvas ID found in URL!');
        return;
    }
    
    updateCanvas(extractedId, elements);
  };

const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {}, // Provide a dummy function
        button: 0, // Simulate left mouse button
    };
    boardMouseDownHandler(simulatedEvent, toolboxState);
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
    };
    setCursorPosition({ x: touch.clientX, y: touch.clientY }); // Also update cursor for touch
    boardMouseMoveHandler(simulatedEvent);
  };

  const handleTouchEnd = () => {
    boardMouseUpHandler();
  };

  const handleWheel = (event) => {
    boardWheelHandler(event);
  };

  // Convert canvas coordinates to screen coordinates for textarea positioning
  const getTextAreaPosition = () => {
    if (elements.length === 0) return { top: 0, left: 0 };
    
    const lastElement = elements[elements.length - 1];
    const screenX = lastElement.x1 * viewport.scale + viewport.x;
    const screenY = lastElement.y1 * viewport.scale + viewport.y;
    
    return {
      top: screenY,
      left: screenX,
    };
  };

  const textAreaPosition = getTextAreaPosition();

  return (
    <div 
      ref={containerRef}
      className={classes.boardContainer}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: getCursorStyle(),
      }}
    >
      {/* Zoom and pan controls */}
      <div className={classes.viewportControls} style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <button 
          onClick={() => zoomViewport(1.2, window.innerWidth / 2, window.innerHeight / 2)}
          style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
        >
          Zoom In (+)
        </button>
        <button 
          onClick={() => zoomViewport(0.8, window.innerWidth / 2, window.innerHeight / 2)}
          style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
        >
          Zoom Out (-)
        </button>
        <button 
          onClick={resetViewport}
          style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
        >
          Reset View (0)
        </button>
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
          {Math.round(viewport.scale * 100)}%
        </div>
      </div>

      {/* Help text */}
      {/* <div className={classes.helpText} style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.2)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px',
      }}>
        <div><strong>Pan:</strong> Ctrl/Cmd + Mouse drag or Arrow keys</div>
        <div><strong>Zoom:</strong> Mouse wheel or Ctrl/Cmd + (+/-)</div>
        <div><strong>Reset:</strong> Ctrl/Cmd + 0</div>
        <div><strong>Undo/Redo:</strong> Ctrl/Cmd + Z/Y</div>
      </div> */}

      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            position: 'fixed',
            top: textAreaPosition.top,
            left: textAreaPosition.left,
            fontSize: `${(elements[elements.length - 1]?.size || 30) * viewport.scale}px`,
            color: elements[elements.length - 1]?.stroke || '#000000',
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: 'auto',
            height: 'auto',
            overflow: 'hidden',
            fontFamily: 'Caveat',
            lineHeight: 'inherit',
            minWidth: '20px',
            minHeight: '30px',
            zIndex: 1000,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
      
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'block',
          cursor: getCursorStyle(),
        }}
      />
    </div>
  );
}

export default Board;