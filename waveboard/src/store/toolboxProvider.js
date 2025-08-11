import React, { useReducer,useEffect } from 'react';
import toolboxContext from './toolbox-context';
import { COLORS, TOOLBOX_ACTIONS, TOOL_ITEMS } from '../constants';

function toolboxReducer(state, action) {
  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE:{
      const newState = { ...state };
      newState[action.payload.tool].stroke = action.payload.stroke;
      return newState;
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL:{
      const newState = { ...state };
      newState[action.payload.tool].fill = action.payload.fill;
      return newState;
    }
    case TOOLBOX_ACTIONS.CHANGE_SIZE :{
      const newState = { ...state };
      newState[action.payload.tool].size = action.payload.size;
      return newState;
    }
    case TOOLBOX_ACTIONS.UPDATE_COLORS: {
        const newState = { ...state };
        for (const tool in action.payload) {
            if (newState[tool]) {
                newState[tool].stroke = action.payload[tool].stroke;
            }
        }
        return newState;
    }
    default:
      return state;
  }
}

const initialToolboxState = {
  [TOOL_ITEMS.BRUSH]: {
    stroke: COLORS.BLACK,
    size: 2,
  }, 
   [TOOL_ITEMS.AI_BRUSH]: {
    stroke: COLORS.BLACK,
    size: 2, 
  },
  [TOOL_ITEMS.LINE]: {
    stroke: COLORS.BLACK,
    size: 1,
  },
  [TOOL_ITEMS.RECTANGLE]: {
    stroke: COLORS.BLACK,
    size: 1,
    fill: null,
  },
  [TOOL_ITEMS.CIRCLE]: {
    stroke: COLORS.BLACK,
    size: 1,
    fill: null,
  },
  [TOOL_ITEMS.ARROW]: {
    stroke: COLORS.BLACK,
    size: 1,
  },
   [TOOL_ITEMS.TRIANGLE]: {
    stroke: COLORS.BLACK,
    size: 1,
    fill: null,
  },
  [TOOL_ITEMS.DIAMOND]: {
    stroke: COLORS.BLACK,
    size: 1,
    fill: null,
  },
  [TOOL_ITEMS.TEXT]: {
    stroke: COLORS.BLACK,
    size: 32,
  },
};

const ToolboxProvider = ({ children,isDarkMode  }) => {
  const [toolboxState, dispatchToolboxAction] = useReducer(toolboxReducer, initialToolboxState);

   useEffect(() => {
    const newColors = {};
    const defaultColor = isDarkMode ? COLORS.WHITE : COLORS.BLACK;

    // We prepare a payload of color updates
    for (const tool in toolboxState) {
        // If the current stroke is black (light mode default) or white (dark mode default), swap it.
        if (toolboxState[tool].stroke === COLORS.BLACK || toolboxState[tool].stroke === COLORS.WHITE) {
            newColors[tool] = { stroke: defaultColor };
        }
    }
     // Dispatch one action to update all relevant tool colors
    if (Object.keys(newColors).length > 0) {
        dispatchToolboxAction({
            type: TOOLBOX_ACTIONS.UPDATE_COLORS,
            payload: newColors
        });
    }
  }, [isDarkMode]);

  const changeStrokeHandler = (tool, stroke) => {
    dispatchToolboxAction({
      type:  TOOLBOX_ACTIONS.CHANGE_STROKE,
      payload: {
        tool,
        stroke,
      },
    });
  };
  const changeFillHandler = (tool, fill) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_FILL,
      payload: {
        tool,
        fill,
      },
    });
  };
  const changeSizeHandler = (tool,size) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_SIZE,
      payload: {
        tool,
        size,
      },
    });
  };

  const toolboxContextValue = {
    toolboxState,
    changeStroke: changeStrokeHandler,
    changeFill: changeFillHandler,
    changeSize: changeSizeHandler,
  };

  return (
    <toolboxContext.Provider value={toolboxContextValue}>
      {children}
    </toolboxContext.Provider>
  );
};

export default ToolboxProvider;
