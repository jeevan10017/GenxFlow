import React, { useContext, useState } from "react";
import cx from "classnames";
import classes from "./index.module.css";
import {
  COLORS,
  FILL_TOOL_TYPES,
  SIZE_TOOL_TYPES,
  STROKE_TOOL_TYPES,
  TOOL_ITEMS,
} from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import boardContext from "../../store/board-context";

// Pass isDarkMode as a prop
const Toolbox = ({ isDarkMode }) => {
  const { activeToolItem } = useContext(boardContext);
  const { toolboxState, changeStroke, changeFill, changeSize } =
    useContext(toolboxContext);

  const strokeColor = toolboxState[activeToolItem]?.stroke;
  const fillColor = toolboxState[activeToolItem]?.fill;
  const size = toolboxState[activeToolItem]?.size;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Prevent dragging when interacting with form elements
    if (e.target.tagName === 'INPUT' || e.target.type === 'color') return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    // Conditionally apply the .dark class based on the isDarkMode prop
    <div
      className={cx(classes.container, { [classes.dark]: isDarkMode })}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Stroke Color Section */}
      {STROKE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>Stroke</div>
          <div className={classes.colorsContainer}>
            <input
              className={classes.colorPicker}
              type="color"
              value={strokeColor}
              onChange={(e) => changeStroke(activeToolItem, e.target.value)}
            />
            {Object.keys(COLORS).map((k) => (
              <div
                key={k}
                className={cx(classes.colorBox, {
                  [classes.activeColorBox]: strokeColor === COLORS[k],
                })}
                style={{ backgroundColor: COLORS[k] }}
                onClick={() => changeStroke(activeToolItem, COLORS[k])}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fill Color Section */}
      {FILL_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>Fill</div>
          <div className={classes.colorsContainer}>
            <div
              title="No Fill"
              className={cx(classes.colorBox, classes.noFillColorBox, {
                [classes.activeColorBox]: fillColor === null,
              })}
              onClick={() => changeFill(activeToolItem, null)}
            />
            <input
              className={classes.colorPicker}
              type="color"
              value={fillColor || '#ffffff'}
              onChange={(e) => changeFill(activeToolItem, e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Size/Thickness Section */}
      {SIZE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            {activeToolItem === TOOL_ITEMS.TEXT ? "Size" : "Thickness"}
          </div>
          <input
            className={classes.sizeSlider}
            type="range"
            min={activeToolItem === TOOL_ITEMS.TEXT ? 16 : 1}
            max={activeToolItem === TOOL_ITEMS.TEXT ? 128 : 50}
            step={1}
            value={size}
            onChange={(event) =>
              changeSize(activeToolItem, parseInt(event.target.value, 10))
            }
          />
        </div>
      )}
    </div>
  );
};

export default Toolbox;