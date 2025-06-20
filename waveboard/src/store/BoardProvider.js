import React, { useCallback, useReducer, useEffect } from "react";
import boardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from "../constants";
import {
  createElement,
  getSvgPathFromStroke,
  isPointNearElement,
} from "../utils/element";
import getStroke from "perfect-freehand";

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    }
    case BOARD_ACTIONS.CHANGE_ACTION_TYPE:
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    
    // New viewport actions
    case BOARD_ACTIONS.SET_VIEWPORT: {
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload,
        },
      };
    }
    case BOARD_ACTIONS.PAN_VIEWPORT: {
      return {
        ...state,
        viewport: {
          ...state.viewport,
          x: state.viewport.x + action.payload.deltaX,
          y: state.viewport.y + action.payload.deltaY,
        },
      };
    }
    case BOARD_ACTIONS.ZOOM_VIEWPORT: {
      const { scale, centerX, centerY } = action.payload;
      const newScale = Math.max(0.1, Math.min(5, state.viewport.scale * scale));
      
      // Calculate new position to zoom towards the center point
      const scaleRatio = newScale / state.viewport.scale;
      const newX = centerX - (centerX - state.viewport.x) * scaleRatio;
      const newY = centerY - (centerY - state.viewport.y) * scaleRatio;
      
      return {
        ...state,
        viewport: {
          ...state.viewport,
          scale: newScale,
          x: newX,
          y: newY,
        },
      };
    }
    
    // Pan state management
    case BOARD_ACTIONS.START_PAN: {
      return {
        ...state,
        isPanning: true,
        lastPanPoint: action.payload,
        toolActionType: TOOL_ACTION_TYPES.PANNING,
      };
    }
    case BOARD_ACTIONS.UPDATE_PAN_POINT: {
      return {
        ...state,
        lastPanPoint: action.payload,
      };
    }
    case BOARD_ACTIONS.END_PAN: {
      return {
        ...state,
        isPanning: false,
        lastPanPoint: { x: 0, y: 0 },
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }
    
    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;
      // Convert screen coordinates to canvas coordinates
      const canvasX = (clientX - state.viewport.x) / state.viewport.scale;
      const canvasY = (clientY - state.viewport.y) / state.viewport.scale;
      
      const newElement = createElement(
        state.elements.length,
        canvasX,
        canvasY,
        canvasX,
        canvasY,
        { type: state.activeToolItem, stroke, fill, size }
      );
      const prevElements = state.elements;
      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: [...prevElements, newElement],
      };
    }
    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      // Convert screen coordinates to canvas coordinates
      const canvasX = (clientX - state.viewport.x) / state.viewport.scale;
      const canvasY = (clientY - state.viewport.y) / state.viewport.scale;
      
      const newElements = [...state.elements];
      const index = state.elements.length - 1;
      const { type } = newElements[index];
      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          const { x1, y1, stroke, fill, size } = newElements[index];
          const newElement = createElement(index, x1, y1, canvasX, canvasY, {
            type: state.activeToolItem,
            stroke,
            fill,
            size,
          });
          newElements[index] = newElement;
          return {
            ...state,
            elements: newElements,
          };
        case TOOL_ITEMS.BRUSH:
          newElements[index].points = [
            ...newElements[index].points,
            { x: canvasX, y: canvasY },
          ];
          newElements[index].path = new Path2D(
            getSvgPathFromStroke(getStroke(newElements[index].points))
          );
          return {
            ...state,
            elements: newElements,
          };
        default:
          throw new Error("Type not recognized");
      }
    }
    case BOARD_ACTIONS.DRAW_UP: {
      const elementsCopy = [...state.elements];
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(elementsCopy);
      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;
      // Convert screen coordinates to canvas coordinates
      const canvasX = (clientX - state.viewport.x) / state.viewport.scale;
      const canvasY = (clientY - state.viewport.y) / state.viewport.scale;
      
      let newElements = [...state.elements];
      newElements = newElements.filter((element) => {
        return !isPointNearElement(element, canvasX, canvasY);
      });
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);
      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.CHANGE_TEXT: {
      const index = state.elements.length - 1;
      const newElements = [...state.elements];
      newElements[index].text = action.payload.text;
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);
      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.UNDO: {
      if (state.index <= 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1],
        index: state.index - 1,
      };
    }
    case BOARD_ACTIONS.REDO: {
      if (state.index >= state.history.length - 1) return state;
      return {
        ...state,
        elements: state.history[state.index + 1],
        index: state.index + 1,
      };
    }
    
    case BOARD_ACTIONS.RESET_ELEMENTS: {
      return {
        ...state,
        elements: action.payload.elements,
        history: [action.payload.elements],
        index: 0,
      };
    }

    case BOARD_ACTIONS.REMOTE_UPDATE: {
      if (state.toolActionType === TOOL_ACTION_TYPES.DRAWING || 
          state.toolActionType === TOOL_ACTION_TYPES.WRITING ||
          state.toolActionType === TOOL_ACTION_TYPES.ERASING) {
        return state;
      }
      
      const processedElements = processLoadedElements(action.payload.elements);
      return {
        ...state,
        elements: processedElements,
      };
    }
    
    default:
      return state;
  }
};

// Helper function to serialize elements for socket transmission
const serializeElementsForSocket = (elements) => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    const serializedElement = { ...element };
    
    if (serializedElement.path) {
      delete serializedElement.path;
    }
    
    if (typeof serializedElement.stroke === 'object') {
      serializedElement.stroke = serializedElement.stroke?.toString() || '#000000';
    }
    if (typeof serializedElement.fill === 'object') {
      serializedElement.fill = serializedElement.fill?.toString() || 'transparent';
    }
    
    return serializedElement;
  });
};

// Helper function to process loaded elements
const processLoadedElements = (elements) => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    const cleanElement = {
      ...element,
      stroke: typeof element.stroke === 'string' ? element.stroke : '#000000',
      fill: typeof element.fill === 'string' ? element.fill : 'transparent',
    };
    
    if (element.type === TOOL_ITEMS.BRUSH && element.points && !element.path) {
      try {
        cleanElement.path = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
      } catch (error) {
        console.warn('Failed to reconstruct path for brush element:', error);
        return null;
      }
    }
    
    return cleanElement;
  }).filter(Boolean);
};

const BoardProvider = ({ 
  children, 
  canvasId, 
  initialElements, 
  onCanvasUpdate, 
  onCursorMove 
}) => {
  const getInitialState = () => {
    const processedElements = processLoadedElements(initialElements);
    return {
      activeToolItem: TOOL_ITEMS.BRUSH,
      toolActionType: TOOL_ACTION_TYPES.NONE,
      elements: processedElements,
      history: [processedElements],
      index: 0,
      // Viewport state
      viewport: {
        x: 0,
        y: 0,
        scale: 1,
      },
      // Pan state
      isPanning: false,
      lastPanPoint: { x: 0, y: 0 },
      // Touch/trackpad state
      lastTouchDistance: 0,
      isMultiTouch: false,
    };
  };
  
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    getInitialState()
  );

  // Handle initial elements loading
  useEffect(() => {
    if (initialElements && initialElements.length > 0) {
      const processedElements = processLoadedElements(initialElements);
      dispatchBoardAction({
        type: BOARD_ACTIONS.RESET_ELEMENTS,
        payload: { elements: processedElements }
      });
    }
  }, [initialElements]);

  // Prevent browser zoom on the canvas area
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const preventPinchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

 
    document.addEventListener('wheel', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    return () => {
      document.removeEventListener('wheel', preventZoom);
      document.removeEventListener('touchmove', preventPinchZoom);
      document.removeEventListener('gesturestart', (e) => e.preventDefault());
      document.removeEventListener('gesturechange', (e) => e.preventDefault());
      document.removeEventListener('gestureend', (e) => e.preventDefault());
    };
  }, []);

  // Emit canvas updates to other users with proper serialization
  const emitCanvasUpdate = useCallback((updateType, data = {}) => {
    if (onCanvasUpdate) {
      const shouldSendElements = ['drawComplete', 'textComplete', 'undo', 'redo', 'erasing'].includes(updateType);
      
      onCanvasUpdate({
        type: updateType,
        elements: shouldSendElements ? serializeElementsForSocket(boardState.elements) : undefined,
        timestamp: Date.now(),
        ...data
      });
    }
  }, [onCanvasUpdate, boardState.elements]);

  // Handle remote canvas updates from other users
  const handleRemoteUpdate = useCallback((updateData) => {
    if (!updateData || !updateData.elements) {
      return;
    }
    
    try {
      dispatchBoardAction({
        type: BOARD_ACTIONS.REMOTE_UPDATE,
        payload: { elements: updateData.elements }
      });
    } catch (error) {
      console.error('Error applying remote update:', error);
    }
  }, []);

  // Expose the remote update handler for the parent component
  useEffect(() => {
    if (window.boardProviderHandlers) {
      window.boardProviderHandlers[canvasId] = { handleRemoteUpdate };
    } else {
      window.boardProviderHandlers = {
        [canvasId]: { handleRemoteUpdate }
      };
    }

    return () => {
      if (window.boardProviderHandlers) {
        delete window.boardProviderHandlers[canvasId];
      }
    };
  }, [canvasId, handleRemoteUpdate]);

  const changeToolHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool,
      },
    });
  };

  // Viewport handlers
  const panViewport = useCallback((deltaX, deltaY) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.PAN_VIEWPORT,
      payload: { deltaX, deltaY },
    });
  }, []);

  const zoomViewport = useCallback((scale, centerX, centerY) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.ZOOM_VIEWPORT,
      payload: { scale, centerX, centerY },
    });
  }, []);

  const resetViewport = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.SET_VIEWPORT,
      payload: { x: 0, y: 0, scale: 1 },
    });
  }, []);

  // Get distance between two touch points
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point between two touches
  const getTouchCenter = (touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    
    const { clientX, clientY } = event;
    
    // Check if this is a pan operation (middle mouse button or space key held)
    if (event.button === 1 || event.shiftKey) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.START_PAN,
        payload: { x: clientX, y: clientY },
      });
      return;
    }
    
    if (onCursorMove) {
      onCursorMove({ x: clientX, y: clientY, action: 'mousedown' });
    }
    
    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }
    
    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size,
      },
    });
  };

  const boardMouseMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    
    const { clientX, clientY } = event;
    
    if (onCursorMove) {
      onCursorMove({ x: clientX, y: clientY, action: 'mousemove' });
    }
    
    if (boardState.toolActionType === TOOL_ACTION_TYPES.PANNING && boardState.isPanning) {
      const deltaX = clientX - boardState.lastPanPoint.x;
      const deltaY = clientY - boardState.lastPanPoint.y;
      panViewport(deltaX, deltaY);
      dispatchBoardAction({
        type: BOARD_ACTIONS.UPDATE_PAN_POINT,
        payload: { x: clientX, y: clientY },
      });
      return;
    }
    
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: {
          clientX,
          clientY,
        },
      });
      emitCanvasUpdate('erasing', { x: clientX, y: clientY });
    }
  };

  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
      });
      setTimeout(() => {
        emitCanvasUpdate('drawComplete');
      }, 0);
    }
    
    if (boardState.toolActionType === TOOL_ACTION_TYPES.PANNING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.END_PAN,
      });
      return;
    }
    
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  };

  // Touch event handlers for trackpad/touchscreen gestures
  const boardTouchStartHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    
    if (event.touches.length === 2) {
      event.preventDefault();
      const distance = getTouchDistance(event.touches);
      const center = getTouchCenter(event.touches);
      
      dispatchBoardAction({
        type: BOARD_ACTIONS.SET_VIEWPORT,
        payload: { 
          ...boardState.viewport,
          lastTouchDistance: distance,
          isMultiTouch: true,
          lastPanPoint: center,
        },
      });
    } else if (event.touches.length === 1) {
      if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
        dispatchBoardAction({
          type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
          payload: { actionType: TOOL_ACTION_TYPES.ERASING },
        });
      }
    }
  };

  const boardTouchMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    
    if (event.touches.length === 2) {
      event.preventDefault();
      const distance = getTouchDistance(event.touches);
      const center = getTouchCenter(event.touches);
      
      if (boardState.lastTouchDistance > 0) {
        // Handle zoom
        const scale = distance / boardState.lastTouchDistance;
        if (Math.abs(scale - 1) > 0.01) {
          zoomViewport(scale, center.x, center.y);
        }
        
        // Handle pan
        const deltaX = center.x - boardState.lastPanPoint.x;
        const deltaY = center.y - boardState.lastPanPoint.y;
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          panViewport(deltaX, deltaY);
        }
      }
      
      dispatchBoardAction({
        type: BOARD_ACTIONS.SET_VIEWPORT,
        payload: { 
          ...boardState.viewport,
          lastTouchDistance: distance,
          lastPanPoint: center,
        },
      });
    }
  };

  const boardTouchEndHandler = (event) => {
    if (event.touches.length === 0) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.SET_VIEWPORT,
        payload: { 
          ...boardState.viewport,
          isMultiTouch: false,
          lastTouchDistance: 0,
          lastPanPoint: { x: 0, y: 0 },
        },
      });
      
      if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
        dispatchBoardAction({
          type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
          payload: { actionType: TOOL_ACTION_TYPES.NONE },
        });
      }
    }
  };

  const boardWheelHandler = (event) => {
    event.preventDefault();
    
    const { clientX, clientY, deltaY, ctrlKey, metaKey } = event;
    
    if (ctrlKey || metaKey) {
      const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
      zoomViewport(zoomFactor, clientX, clientY);
    } else {
      const deltaX = event.deltaX || 0;
      const panDeltaY = deltaY;
      panViewport(-deltaX, -panDeltaY);
    }
  };

  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
    emitCanvasUpdate('textComplete', { text });
  };

  const boardUndoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
    setTimeout(() => {
      emitCanvasUpdate('undo');
    }, 0);
  }, [emitCanvasUpdate]);

  const boardRedoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
    setTimeout(() => {
      emitCanvasUpdate('redo');
    }, 0);
  }, [emitCanvasUpdate]);

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    viewport: boardState.viewport,
    isPanning: boardState.isPanning,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    boardTouchStartHandler,
    boardTouchMoveHandler,
    boardTouchEndHandler,
    boardWheelHandler,
    textAreaBlurHandler,
    undo: boardUndoHandler,
    redo: boardRedoHandler,
    handleRemoteUpdate,
    panViewport,
    zoomViewport,
    resetViewport,
  };

  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;