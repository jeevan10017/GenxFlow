import React, { useContext } from 'react';
import classes from './index.module.css';
import { FaBrain, FaBolt } from 'react-icons/fa';
import boardContext from '../../store/board-context';
import { TOOL_ITEMS } from '../../constants';

const AiBrush = ({ onClose }) => {
  const { changeToolHandler } = useContext(boardContext);

  const handleModeSelect = (tool) => {
    changeToolHandler(tool);
    onClose();
  };

  return (
    <div className={classes.modalBackdrop}>
      <div className={classes.modalContent}>
        <h3 className={classes.title}>Select AI Brush Mode</h3>
        <div className={classes.optionsContainer}>
          <button
            className={classes.optionButton}
            onClick={() => handleModeSelect(TOOL_ITEMS.AI_BRUSH)}
          >
            <FaBolt className={classes.icon} />
            <span className={classes.label}>Algorithmic</span>
            <span className={classes.sublabel}>Fast & Simple Shapes</span>
          </button>
          <button
            className={`${classes.optionButton} ${classes.disabled}`}
            title="Coming Soon!"
            disabled
          >
            <FaBrain className={classes.icon} />
            <span className={classes.label}>Machine Learning</span>
            <span className={classes.sublabel}>Complex Shapes & Letters</span>
          </button>
        </div>
        <button className={classes.closeButton} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AiBrush;