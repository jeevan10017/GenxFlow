import React, { useContext, useState } from "react";
import classes from "./index.module.css";
import cx from "classnames";
import {
  FaSlash, FaRegCircle, FaArrowRight, FaPaintBrush, FaEraser,
  FaUndoAlt, FaRedoAlt, FaFont, FaDownload, FaAdjust, FaMagic, FaTrash,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { LuRectangleHorizontal } from "react-icons/lu";
import { TOOL_ITEMS } from "../../constants";
import boardContext from "../../store/board-context";
import toolboxContext from "../../store/toolbox-context";
import { useNavigate } from "react-router-dom";
import AiBrush from "../AiBrush";

const Toolbar = ({ isDarkMode, toggleDarkMode }) => {
  const { activeToolItem, changeToolHandler, undo, redo, clearCanvas } =
    useContext(boardContext);
  const { isGuest, onAiBrushAttempt } = useContext(toolboxContext);

  const [showAiBrushModal, setShowAiBrushModal] = useState(false);
  const navigate = useNavigate();

  const handleDownloadClick = () => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0);

    const logo = new Image();
    logo.src = "/logo_light_nobg.png";
    logo.onload = () => {
      const logoWidth = 120;
      const logoHeight = (logo.height / logo.width) * logoWidth;
      const x = exportCanvas.width - logoWidth - 20;
      const y = exportCanvas.height - logoHeight - 20;
      ctx.globalAlpha = 0.4;
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
      const data = exportCanvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = data;
      anchor.download = "board.png";
      anchor.click();
    };
  };

  const handleAiBrushClick = () => {
    if (isGuest && onAiBrushAttempt) {
      onAiBrushAttempt();
    } else {
      setShowAiBrushModal(true);
    }
  };

  // 1. Centralized configuration array for all toolbar items.
  const toolbarItems = [
    { id: TOOL_ITEMS.BRUSH, icon: <FaPaintBrush />, tooltip: "Brush" },
    {
      id: "ai-brush",
      icon: <FaMagic />,
      tooltip: "AI Brush",
      onClick: handleAiBrushClick,
      // Custom active check for AI brush states
      isActive: [TOOL_ITEMS.AI_BRUSH, TOOL_ITEMS.AI_BRUSH_ML].includes(activeToolItem),
    },
    { id: TOOL_ITEMS.LINE, icon: <FaSlash />, tooltip: "Line" },
    { id: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal />, tooltip: "Rectangle" },
    { id: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle />, tooltip: "Circle" },
    { id: TOOL_ITEMS.ARROW, icon: <FaArrowRight />, tooltip: "Arrow" },
    { id: TOOL_ITEMS.ERASER, icon: <FaEraser />, tooltip: "Eraser" },
    { id: TOOL_ITEMS.TEXT, icon: <FaFont />, tooltip: "Text" },
    {
      id: "clear",
      icon: <FaTrash />,
      tooltip: "Clear Canvas",
      onClick: () => {
        if (window.confirm("Are you sure you want to clear the board? This cannot be undone.")) {
          clearCanvas();
        }
      },
    },
    { id: "undo", icon: <FaUndoAlt />, tooltip: "Undo", onClick: undo },
    { id: "redo", icon: <FaRedoAlt />, tooltip: "Redo", onClick: redo },
    { id: "download", icon: <FaDownload />, tooltip: "Download", onClick: handleDownloadClick },
    { id: "theme", icon: <FaAdjust />, tooltip: "Toggle Theme", onClick: toggleDarkMode },
    { id: "profile", icon: <CgProfile />, tooltip: "Profile", onClick: () => navigate("/") },
  ];

  return (
    <>
      <div className={cx(classes.container, { [classes.dark]: isDarkMode })}>
        {/* 2. Render all items by mapping over the configuration array */}
        {toolbarItems.map(({ id, icon, tooltip, onClick, isActive }) => (
          <div
            key={id}
            title={tooltip} // Adds a helpful tooltip on hover
            className={cx(classes.toolItem, {
              // 3. Conditional logic is handled cleanly inside the map
              [classes.active]: isActive !== undefined ? isActive : activeToolItem === id,
            })}
            onClick={onClick || (() => changeToolHandler(id))}
          >
            {icon}
          </div>
        ))}
      </div>

      {showAiBrushModal && (
        <AiBrush
          isDarkMode={isDarkMode}
          onClose={() => setShowAiBrushModal(false)}
        />
      )}
    </>
  );
};

export default Toolbar;