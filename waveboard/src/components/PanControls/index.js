import React, { useContext } from 'react';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import boardContext from '../../store/board-context';
import classes from './index.module.css';
import cx from 'classnames';

const PanControls = ({ isDarkMode }) => {
  const { panViewport } = useContext(boardContext);
  const PAN_AMOUNT = 50; // How many pixels to move on each click

  return (
    <div className={cx(classes.panContainer, { [classes.dark]: isDarkMode })}>
      <button onClick={() => panViewport(0, PAN_AMOUNT)}><FaArrowUp /></button>
      <div className={classes.middleRow}>
        <button onClick={() => panViewport(PAN_AMOUNT, 0)}><FaArrowLeft /></button>
        <button onClick={() => panViewport(-PAN_AMOUNT, 0)}><FaArrowRight /></button>
      </div>
      <button onClick={() => panViewport(0, -PAN_AMOUNT)}><FaArrowDown /></button>
    </div>
  );
};

export default PanControls;