import React, { useContext } from 'react';
import classes from './index.module.css';
import { FaBrain, FaBolt, FaPencilAlt, FaShapes } from 'react-icons/fa'; 
import boardContext from '../../store/board-context';
import { TOOL_ITEMS } from '../../constants';
import cx from 'classnames';

const AiBrush = ({ onClose, isDarkMode }) => {
  const { changeToolHandler } = useContext(boardContext);

  // The handler now passes both the tool and the desired prediction mode
  const handleModeSelect = (tool, mode = null) => {
    changeToolHandler(tool, mode);
    onClose();
  };

  return (
    <div className={classes.modalBackdrop}>
       <div className={cx(classes.modalContent, { [classes.dark]: isDarkMode })}>
        <h3 className={classes.title}>Select AI Brush Mode</h3>
        <div className={classes.optionsContainer}>
          {/* Option 1: The old algorithmic brush */}
          <button
            className={classes.optionButton}
            onClick={() => handleModeSelect(TOOL_ITEMS.AI_BRUSH)}
          >
            <FaBolt className={classes.icon} />
            <span className={classes.label}>Simple Shapes</span>
            <span className={classes.sublabel}>Algorithmic</span>
          </button>

          {/* Option 2: ML for complex shapes */}
          <button
            className={classes.optionButton}
            onClick={() => handleModeSelect(TOOL_ITEMS.AI_BRUSH_ML, 'shape')}
          >
            <FaShapes className={classes.icon} />
            <span className={classes.label}>Shapes</span>
            <span className={classes.sublabel}>ML Recognition</span>
          </button>

          {/* Option 3: ML for handwriting */}
          <button
            className={classes.optionButton}
            onClick={() => handleModeSelect(TOOL_ITEMS.AI_BRUSH_ML, 'alphabet')}
          >
            <FaPencilAlt className={classes.icon} />
            <span className={classes.label}>Handwriting</span>
            <span className={classes.sublabel}>ML Recognition</span>
          </button>
        </div>
        <button className={classes.closeButton} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AiBrush;