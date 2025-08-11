// src/utils/recognizer.js

import { TOOL_ITEMS } from "../../constants";

// Helper: Calculates the distance between two points
const distance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// Helper: Calculates the bounding box of a set of points
const getBoundingBox = (points) => {
    if (!points || points.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};

// Helper: Calculates polygon area using the Shoelace formula
const getPolygonArea = (points) => {
    let area = 0;
    const n = points.length;
    if (n < 3) return 0;
    for (let i = 0; i < n; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % n]; // Wrap around to the first point
        area += p1.x * p2.y - p2.x * p1.y;
    }
    return Math.abs(area / 2);
};

// Helper: Calculates the change in angle at each point in a path
const getAngles = (points) => {
    if (points.length < 3) return [];
    const angles = [];
    for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[i + 1];
        const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        angles.push(Math.abs(angle * 180 / Math.PI));
    }
    return angles;
};


// --- Shape Recognition Functions ---

function isLine(points) {
    if (points.length < 2) return null;
    const first = points[0];
    const last = points[points.length - 1];
    const threshold = 0.95; 
    let nearPoints = 0;

    for (const p of points) {
        const d = Math.abs((last.y - first.y) * p.x - (last.x - first.x) * p.y + last.x * first.y - last.y * first.x) / distance(first, last);
        if (d < 5) {
            nearPoints++;
        }
    }

    if (nearPoints / points.length > threshold) {
        return { shape: TOOL_ITEMS.LINE, box: { minX: first.x, minY: first.y, maxX: last.x, maxY: last.y } };
    }
    return null;
}

function isCircle(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    const center = { x: box.minX + box.width / 2, y: box.minY + box.height / 2 };
    
    let totalDistance = 0;
    let distances = [];
    for (const p of points) {
        const d = distance(center, p);
        totalDistance += d;
        distances.push(d);
    }
    const avgRadius = totalDistance / points.length;

    const aspectRatio = box.width / box.height;
    if (aspectRatio < 0.7 || aspectRatio > 1.4) return null;

    let stdDev = 0;
    for(const d of distances) {
        stdDev += Math.pow(d - avgRadius, 2);
    }
    stdDev = Math.sqrt(stdDev / distances.length);
    
    if (stdDev < avgRadius * 0.3) {
        return { shape: TOOL_ITEMS.CIRCLE, box };
    }
    return null;
}

function isRectangle(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    if (box.width < 10 || box.height < 10) return null;

    const area = getPolygonArea(points);
    const boxArea = box.width * box.height;
    const areaRatio = area / boxArea;

    if (areaRatio > 0.7) {
        return { shape: TOOL_ITEMS.RECTANGLE, box };
    }
    return null;
}

function isTriangle(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    if (box.width < 10 || box.height < 10) return null;

    const isClosed = distance(points[0], points[points.length - 1]) < (box.width + box.height) / 4;
    if (!isClosed) return null;

    const area = getPolygonArea(points);
    const boxArea = box.width * box.height;
    const areaRatio = area / boxArea;

    if (areaRatio > 0.3 && areaRatio < 0.7) {
        const angles = getAngles(points);
        const corners = angles.filter(angle => angle > 45 && angle < 160).length;
        if (corners >= 2 && corners <= 4) {
             return { shape: TOOL_ITEMS.TRIANGLE, box };
        }
    }
    return null;
}

function isDiamond(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    if (box.width < 10 || box.height < 10) return null;
    
    const isClosed = distance(points[0], points[points.length - 1]) < (box.width + box.height) / 4;
    if (!isClosed) return null;

    const area = getPolygonArea(points);
    const boxArea = box.width * box.height;
    const areaRatio = area / boxArea;

    if (areaRatio > 0.3 && areaRatio < 0.7) {
        const angles = getAngles(points);
        const corners = angles.filter(angle => angle > 45 && angle < 160).length;
        if (corners >= 3 && corners <= 5) {
             return { shape: TOOL_ITEMS.DIAMOND, box };
        }
    }
    return null;
}


// --- Main Recognizer Function ---
export const recognizeShape = (points) => {
    // Check for shapes in a specific order to avoid misclassification
    const circle = isCircle(points);
    if (circle) return circle;

    const triangle = isTriangle(points);
    if (triangle) return triangle;
    
    const diamond = isDiamond(points);
    if (diamond) return diamond;

    const rectangle = isRectangle(points);
    if (rectangle) return rectangle;

    const line = isLine(points);
    if (line) return line;

    return null; // No shape recognized
};