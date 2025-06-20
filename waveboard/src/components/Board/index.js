import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import { updateCanvas } from "../../utils/api";

import classes from "./index.module.css";

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const containerRef = useRef();
  
  const {
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
    
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the context state
    context.save();
    
    // Apply viewport transformation
    context.translate(viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);
    
    // Draw grid background (optional)
    drawGrid(context, viewport);
    
    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      context.save();
      
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.BRUSH:
          context.fillStyle = element.stroke;
          context.fill(element.path);
          break;
        case TOOL_ITEMS.TEXT:
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          break;
        default:
          throw new Error("Type not recognized");
      }
      
      context.restore();
    });

    // Restore the context state
    context.restore();
  }, [elements, viewport]);

  // Draw grid background
  const drawGrid = (context, viewport) => {
    const gridSize = 20;
    const canvas = context.canvas;
    
    // Calculate grid bounds based on viewport
    const startX = Math.floor(-viewport.x / viewport.scale / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.scale / gridSize) * gridSize;
    const endX = startX + Math.ceil(canvas.width / viewport.scale / gridSize) * gridSize + gridSize;
    const endY = startY + Math.ceil(canvas.height / viewport.scale / gridSize) * gridSize + gridSize;
    
    context.strokeStyle = '#f0f0f0';
    context.lineWidth = 0.5;
    context.globalAlpha = 0.3;
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, endY);
      context.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      context.beginPath();
      context.moveTo(startX, y);
      context.lineTo(endX, y);
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
        style={{
          display: 'block',
          cursor: getCursorStyle(),
        }}
      />
    </div>
  );
}

export default Board;