import { ARROW_LENGTH, TOOL_ITEMS } from "../constants";
import getStroke from "perfect-freehand";

import rough from "roughjs/bin/rough";
import { getArrowHeadsCoordinates, isPointCloseToLine } from "./math";

const gen = rough.generator();

export const createElement = (
  id,
  x1,
  y1,
  x2,
  y2,
  { type, stroke, fill, size }
) => {
  const element = {
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    fill,
    stroke,
    size,
  };

  let options = {
    seed: id + 1,
    fillStyle: "solid",
    stroke: stroke,
    fill: fill,
    strokeWidth: size,
  };

  // --- FIX: Normalize coordinates to handle all drawing directions ---
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);

  const width = maxX - minX;
  const height = maxY - minY;


  switch (type) {
    case TOOL_ITEMS.BRUSH: {
      const brushElement = {
        id,
        points: [{ x: x1, y: y1 }],
        path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }]))),
        type,
        stroke,
        size,
      };
      return brushElement;
    }
    case TOOL_ITEMS.LINE:
      // Line is point-to-point, does not need normalization here.
      element.roughEle = gen.line(x1, y1, x2, y2, options);
      return element;
    case TOOL_ITEMS.RECTANGLE:
      // Use normalized coordinates and positive width/height.
      element.roughEle = gen.rectangle(minX, minY, width, height, options);
      return element;
    case TOOL_ITEMS.CIRCLE:
       // Use normalized values for center and dimensions.
      element.roughEle = gen.ellipse(minX + width / 2, minY + height / 2, width, height, options);
      return element;
    case TOOL_ITEMS.ARROW:
       // Arrow is point-to-point, does not need normalization here.
      const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(x1, y1, x2, y2, ARROW_LENGTH);
      const points = [ [x1, y1], [x2, y2], [x3, y3], [x2, y2], [x4, y4] ];
      element.roughEle = gen.linearPath(points, options);
      return element;
    case TOOL_ITEMS.TRIANGLE:
      // Use normalized coordinates for polygon points.
      const trianglePoints = [
        [minX + width / 2, minY], // Top point
        [minX, maxY],             // Bottom-left
        [maxX, maxY],             // Bottom-right
      ];
      element.roughEle = gen.polygon(trianglePoints, options);
      return element;
    case TOOL_ITEMS.DIAMOND:
       // Use normalized coordinates for polygon points.
      const diamondPoints = [
        [minX + width / 2, minY],        // Top
        [maxX, minY + height / 2],       // Right
        [minX + width / 2, maxY],        // Bottom
        [minX, minY + height / 2],       // Left
      ];
      element.roughEle = gen.polygon(diamondPoints, options);
      return element;
    case TOOL_ITEMS.TEXT:
      element.text = "";
      return element;
    default:
      throw new Error("Type not recognized");
  }
};

export const isPointNearElement = (element, pointX, pointY) => {
  const { x1, y1, x2, y2, type } = element;
  const context = document.getElementById("canvas").getContext("2d");
  switch (type) {
    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.ARROW:
      return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);
    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE:
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)
      );
    case TOOL_ITEMS.BRUSH:
      return context.isPointInPath(element.path, pointX, pointY);
    case TOOL_ITEMS.TEXT:
      context.font = `${element.size * 5}px Caveat`;
      context.fillStyle = element.stroke;
      const textWidth = context.measureText(element.text).width;
      const textHeight = parseInt(element.size);
      context.restore();
      return (
        isPointCloseToLine(x1, y1, x1 + textWidth, y1, pointX, pointY) ||
        isPointCloseToLine(
          x1 + textWidth,
          y1,
          x1 + textWidth,
          y1 + textHeight,
          pointX,
          pointY
        ) ||
        isPointCloseToLine(
          x1 + textWidth,
          y1 + textHeight,
          x1,
          y1 + textHeight,
          pointX,
          pointY
        ) ||
        isPointCloseToLine(x1, y1 + textHeight, x1, y1, pointX, pointY)
      );
    default:
      throw new Error("Type not recognized");
  }
};

export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};