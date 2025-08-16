import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import { updateCanvas } from "../../utils/api";
import { drawElement } from "../../utils/draw";
import classes from "./index.module.css";
import PanControls from "../PanControls"; 

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

  // Render canvas
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = isDarkMode ? '#1f2937' : '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, viewport, isDarkMode);
    context.save();
    context.translate(viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach((element) => {
      drawElement({ roughCanvas, context, element });
    });
    context.restore();
    const isDrawingToolActive = [
  TOOL_ITEMS.BRUSH, TOOL_ITEMS.AI_BRUSH, TOOL_ITEMS.AI_BRUSH_ML, 
  TOOL_ITEMS.LINE, TOOL_ITEMS.RECTANGLE,
  TOOL_ITEMS.CIRCLE, TOOL_ITEMS.ARROW, TOOL_ITEMS.TRIANGLE, TOOL_ITEMS.DIAMOND
].includes(activeToolItem);
    if (isDrawingToolActive) {
      context.fillStyle = isDarkMode ? 'white' : 'black';
      context.beginPath();
      context.arc(cursorPosition.x, cursorPosition.y, 4, 0, 2 * Math.PI);
      context.fill();
    }
    if (activeToolItem === TOOL_ITEMS.ERASER) {
      const radius = 15;
      context.beginPath();
      context.arc(cursorPosition.x, cursorPosition.y, radius, 0, 2 * Math.PI);
      context.fillStyle = 'rgba(120, 120, 120, 0.5)';
      context.fill();
      context.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
      context.lineWidth = 1;
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
    
    context.fillStyle = isDarkMode ? '#718096' : '#9ca3af';
    context.globalAlpha = 0.5;
    
    for (let x = offsetX; x < width; x += gridSize) {
      for (let y = offsetY; y < height; y += gridSize) {
        context.beginPath();
        context.arc(x, y, 1.0, 0, 2 * Math.PI);
        context.fill();
      }
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

  // Get cursor style
  const getCursorStyle = () => {
    if (activeToolItem === TOOL_ITEMS.ERASER) return 'none';
    switch (toolActionType) {
      case TOOL_ACTION_TYPES.PANNING: return 'grabbing';
      case TOOL_ACTION_TYPES.WRITING: return 'text';
      default: return 'crosshair';
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
        if (currentPath === '/guest' || currentPath === '/') {
            console.log("Guest canvas, not saving to server.");
            return; 
        }

        const pathSegments = currentPath.split("/");
        const canvasId = pathSegments.pop();

        if (canvasId) {
            updateCanvas(canvasId, elements);
        } else {
            console.error('Could not find a valid canvas ID to save.');
        }
    };

  // Touch handlers
  const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const simulatedEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      button: 0,
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
    setCursorPosition({ x: touch.clientX, y: touch.clientY });
    boardMouseMoveHandler(simulatedEvent);
  };
  const handleTouchEnd = () => {
    boardMouseUpHandler();
  };
  const handleWheel = (event) => {
    boardWheelHandler(event);
  };

  const getTextAreaPosition = () => {
    if (!elements || elements.length === 0 || !elements[elements.length - 1]) return { top: -100, left: -100 };
    const lastElement = elements[elements.length - 1];
    if (lastElement.type !== TOOL_ITEMS.TEXT) return { top: -100, left: -100 };
    const screenX = lastElement.x1 * viewport.scale + viewport.x;
    const screenY = lastElement.y1 * viewport.scale + viewport.y;
    return { top: screenY, left: screenX };
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
      }}
    >
      <div
        className={classes.viewportControls}
        style={{
          position: "fixed",
          top: "4rem",
          right: "1rem",
          zIndex: 1100,
          color: isDarkMode ? '#ffffff' : '#000000',  
          background: isDarkMode ? '#1f2937' : '#ffffff',
          display: 'flex',
          // Responsive flex direction
          flexDirection: window.innerWidth <= 1024 ? 'column' : 'row',
          alignItems: 'center',
          gap: '4px',
          padding: '6px',
          borderRadius: '6px',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? '#9CA3AF' : '#9CA3AF'}`,
          width: window.innerWidth <= 1024 ? 'auto' : '120px',
        }}
      >
        <button
          style={{
            border: `1px solid ${isDarkMode ? '#9CA3AF' : '#9CA3AF'}`,  
            color: isDarkMode ? '#ffffff' : '#000000',  
            background: isDarkMode ? '#1f2937' : '#ffffff',
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            minWidth: 'auto',
            lineHeight: '1',
            width: window.innerWidth <= 1024 ? '32px' : 'auto',
            height: window.innerWidth <= 1024 ? '32px' : 'auto',
          }}
          onClick={() => zoomViewport(1.2, window.innerWidth / 2, window.innerHeight / 2)}
        >
          +
        </button>
        <button
          style={{
            border: `1px solid ${isDarkMode ? '#9CA3AF' : '#9CA3AF'}`,  
            color: isDarkMode ? '#ffffff' : '#000000',  
            background: isDarkMode ? '#1f2937' : '#ffffff',
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            minWidth: 'auto',
            lineHeight: '1',
            width: window.innerWidth <= 1024 ? '32px' : 'auto',
            height: window.innerWidth <= 1024 ? '32px' : 'auto',
          }}
          onClick={() => zoomViewport(0.8, window.innerWidth / 2, window.innerHeight / 2)}
        >
          -
        </button>
        <button 
          onClick={resetViewport}   
          style={{
            border: `1px solid ${isDarkMode ? '#9CA3AF' : '#9CA3AF'}`,  
            color: isDarkMode ? '#ffffff' : '#000000',  
            background: isDarkMode ? '#1f2937' : '#ffffff',
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            minWidth: 'auto',
            lineHeight: '1',
            width: window.innerWidth <= 1024 ? '32px' : 'auto',
            height: window.innerWidth <= 1024 ? '32px' : 'auto',
          }}
        >
          ⟳
        </button>
        <div 
          className={classes.zoomText}
          style={{
            color: isDarkMode ? '#D1D5DB' : '#374151',
            fontSize: '11px',
            fontWeight: '600',
            marginLeft: window.innerWidth <= 1024 ? '0' : '6px',
            marginTop: window.innerWidth <= 1024 ? '4px' : '0',
          }}
        >
          {Math.round(viewport.scale * 100)}%
        </div>
      </div>

      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            position: 'fixed',
            top: textAreaPosition.top,
            left: textAreaPosition.left,
            fontSize: `${(elements[elements.length - 1]?.size || 30) * viewport.scale}px`,
            color: elements[elements.length - 1]?.stroke || (isDarkMode ? '#FFFFFF' : '#000000'),
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: '1px dashed #888',
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
      <PanControls isDarkMode={isDarkMode} />

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