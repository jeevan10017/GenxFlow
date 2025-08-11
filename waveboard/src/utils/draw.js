import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./element";
import { TOOL_ITEMS } from "../constants";

// This function draws a single element onto a given roughjs canvas instance
export const drawElement = ({ roughCanvas, context, element }) => {
    switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.DIAMOND:
        case TOOL_ITEMS.TRIANGLE:
        case TOOL_ITEMS.ARROW:
            roughCanvas.draw(element.roughEle);
            break;
       case TOOL_ITEMS.BRUSH:
  const strokeOptions = { size: element.size || 2 };
  const path = new Path2D(
    getSvgPathFromStroke(getStroke(element.points, strokeOptions))
  );
  context.fillStyle = element.stroke;
  context.fill(path);
  break;
        case TOOL_ITEMS.TEXT:
            context.textBaseline = "top";
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke;
            context.fillText(element.text, element.x1, element.y1);
            break;
        default:
            // Do nothing for unknown elements
            break;
    }
};