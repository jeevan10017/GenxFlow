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
    // Use a subset of points to avoid noise and improve performance
    const step = Math.max(1, Math.floor(points.length / 20));
    for (let i = step; i < points.length - step; i += step) {
        const p1 = points[i - step];
        const p2 = points[i];
        const p3 = points[i + step];
        const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        angles.push(Math.abs(angle * 180 / Math.PI));
    }
    return angles;
};


// --- Shape Recognition Functions ---

function isLine(points) {
    if (points.length < 5) return null;
    const box = getBoundingBox(points);
    // A line should be much longer than it is wide, or vice-versa.
    // Return null if it's too "square-ish"
    if (Math.min(box.width, box.height) > 0 && Math.max(box.width, box.height) / Math.min(box.width, box.height) < 4) {
        return null;
    }

    const first = points[0];
    const last = points[points.length - 1];
    const threshold = 0.90; // Needs 90% of points to be close to the line
    let nearPoints = 0;

    for (const p of points) {
        // Calculate distance from point to the line defined by first and last points
        const d = Math.abs((last.y - first.y) * p.x - (last.x - first.x) * p.y + last.x * first.y - last.y * first.x) / distance(first, last);
        if (d < 10) { // Allow up to 10px deviation
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

    // A circle should have an aspect ratio close to 1
    const aspectRatio = box.width / box.height;
    if (aspectRatio < 0.75 || aspectRatio > 1.35) return null;

    let stdDev = 0;
    for(const d of distances) {
        stdDev += Math.pow(d - avgRadius, 2);
    }
    stdDev = Math.sqrt(stdDev / distances.length);
    
    // Stricter check: standard deviation of point distances from center must be low
    if (stdDev < avgRadius * 0.22) { 
        return { shape: TOOL_ITEMS.CIRCLE, box };
    }
    return null;
}

function isRectangle(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    if (box.width < 20 || box.height < 20) return null;

    const isClosed = distance(points[0], points[points.length - 1]) < (box.width + box.height) / 4;
    if (!isClosed) return null;

    const area = getPolygonArea(points);
    const boxArea = box.width * box.height;
    const areaRatio = area / boxArea;
    
    const angles = getAngles(points);
    const corners = angles.filter(angle => angle > 60 && angle < 140).length;

    // More forgiving area ratio, looking for 4 corners
    if (areaRatio > 0.65 && corners >= 3 && corners <= 6) {
        return { shape: TOOL_ITEMS.RECTANGLE, box };
    }
    return null;
}

function isTriangle(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    if (box.width < 20 || box.height < 20) return null;

    const isClosed = distance(points[0], points[points.length - 1]) < (box.width + box.height) / 3;
    if (!isClosed) return null;

    const area = getPolygonArea(points);
    const boxArea = box.width * box.height;
    const areaRatio = area / boxArea;
    
    // Area ratio for a triangle is ~0.5 but can vary.
    if (areaRatio > 0.20 && areaRatio < 0.65) {
        const angles = getAngles(points);
        // Look for 3 corners
        const corners = angles.filter(angle => angle > 35).length;
        if (corners >= 2 && corners <= 4) { 
            return { shape: TOOL_ITEMS.TRIANGLE, box };
        }
    }
    return null;
}

function isDiamond(points) {
    if (points.length < 10) return null;
    const box = getBoundingBox(points);
    if (box.width < 20 || box.height < 20) return null;
    
    const isClosed = distance(points[0], points[points.length - 1]) < (box.width + box.height) / 3;
    if (!isClosed) return null;

    const area = getPolygonArea(points);
    const boxArea = box.width * box.height;
    const areaRatio = area / boxArea;

    // Area ratio for a diamond is ~0.5
    if (areaRatio > 0.3 && areaRatio < 0.7) {
        const angles = getAngles(points);
        // Look for 4 corners
        const corners = angles.filter(angle => angle > 40).length;
        if (corners >= 3 && corners <= 5) { 
            return { shape: TOOL_ITEMS.DIAMOND, box };
        }
    }
    return null;
}


// --- Main Recognizer Function ---
export const recognizeShape = (points) => {
    // The order is crucial to prevent misclassification.
    // Check for the most distinct shapes first.
    
    const line = isLine(points);
    if (line) return line;

    // Polygons with corners should be checked before the circle.
    const rectangle = isRectangle(points);
    if (rectangle) return rectangle;

    const triangle = isTriangle(points);
    if (triangle) return triangle;
    
    const diamond = isDiamond(points);
    if (diamond) return diamond;

    // Circle is checked last. If it's not a line or a clear polygon,
    // it might be a circle. This reduces the chance of it incorrectly
    // classifying a sloppy rectangle as a circle.
    const circle = isCircle(points);
    if (circle) return circle;

    return null; // No shape recognized
};