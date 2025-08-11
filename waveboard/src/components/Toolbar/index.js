import React, { useContext, useState } from "react";
import classes from "./index.module.css";

import cx from "classnames";
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
  FaAdjust,
  FaMagic,
  FaTrash,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { LuRectangleHorizontal } from "react-icons/lu";
import { TOOL_ITEMS } from "../../constants";
import boardContext from "../../store/board-context";
import { useNavigate } from "react-router-dom";
import AiBrush from "../AiBrush";

const Toolbar = ({ isDarkMode, toggleDarkMode }) => {
  
  const { activeToolItem, changeToolHandler, undo, redo, clearCanvas } =
    useContext(boardContext);
  const [showAiBrushModal, setShowAiBrushModal] = useState(false);
  const navigate = useNavigate();

  const handleDownloadClick = () => {
    const canvas = document.getElementById("canvas");
    const data = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = "board.png";
    anchor.click();
  };



  return (
    <>
    <div className={cx(classes.container, { [classes.dark]: isDarkMode })}>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.BRUSH)}
      >
        <FaPaintBrush />
      </div>
      <div
          className={cx(classes.toolItem, {
            [classes.active]: activeToolItem === TOOL_ITEMS.AI_BRUSH,
          })}
          onClick={() => setShowAiBrushModal(true)} 
        >
          <FaMagic />
        </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.LINE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.LINE)}
      >
        <FaSlash />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.RECTANGLE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.RECTANGLE)}
      >
        <LuRectangleHorizontal />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.CIRCLE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.CIRCLE)}
      >
        <FaRegCircle />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.ARROW,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.ARROW)}
      >
        <FaArrowRight />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.ERASER,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.ERASER)}
      >
        <FaEraser />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.TEXT,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.TEXT)}
      >
        <FaFont />
      </div>
      <div className={classes.toolItem} onClick={() => {
          if(window.confirm("Are you sure you want to clear the entire board? This action cannot be undone.")) {
            clearCanvas();
          }
        }}>
          <FaTrash />
        </div>
      <div className={classes.toolItem} onClick={undo}>
        <FaUndoAlt />
      </div>
      <div className={classes.toolItem} onClick={redo}>
        <FaRedoAlt />
      </div>
      <div className={classes.toolItem} onClick={handleDownloadClick}>
        <FaDownload />
      </div>
      <div className={classes.toolItem} onClick={toggleDarkMode}>
          <FaAdjust />
        </div>
      <div className={classes.toolItem} onClick={() => navigate("/") }>
        <CgProfile/>
      </div>
      
    </div>
     {showAiBrushModal && <AiBrush onClose={() => setShowAiBrushModal(false)} />}
    </>
  );
};

export default Toolbar;
