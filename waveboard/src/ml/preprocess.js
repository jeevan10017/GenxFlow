// src/ml/preprocess.js
import * as tf from '@tensorflow/tfjs';

/**
 * Takes an array of drawing points and renders them onto a hidden canvas.
 * This process standardizes the drawing to match the format of the training data.
 * @param {Array<Object>} points - Array of {x, y} points from the brush stroke.
 * @param {number} targetSize - The target dimension of the canvas (e.g., 64 for shapes, 28 for letters).
 * @returns {HTMLCanvasElement} A canvas element with the centered and scaled drawing.
 */
function rasterizePath(points, targetSize) {
    // Find the bounding box of the user's drawing.
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    // Create an offscreen canvas to draw on.
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    // Add padding and scale the drawing to fit the canvas while maintaining aspect ratio.
    const padding = targetSize * 0.15;
    const scale = Math.min((targetSize - padding * 2) / width, (targetSize - padding * 2) / height);

    // Calculate the translation needed to center the drawing.
    const translateX = (targetSize - width * scale) / 2;
    const translateY = (targetSize - height * scale) / 2;

    // We need to transform the context to map the drawing's coordinates to the canvas.
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    // Draw the path onto the transformed canvas.
    ctx.fillStyle = '#000'; // Black background
    ctx.fillRect(-minX, -minY, width + minX, height + minY); // Fill to ensure no transparent pixels
    ctx.strokeStyle = '#fff'; // White ink, to match the training data
    ctx.lineWidth = 4.0 / scale; // Adjust line width based on scale to keep it visually consistent.
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x - minX, points[0].y - minY);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x - minX, points[i].y - minY);
    }
    ctx.stroke();

    return canvas;
}

/**
 * Converts a canvas element into a tensor suitable for model input.
 * @param {HTMLCanvasElement} canvas - The canvas with the preprocessed drawing.
 * @returns {tf.Tensor} A tensor of shape [1, size, size, 1].
 */
export function canvasToTensor(canvas) {
    // tf.tidy helps prevent memory leaks by automatically cleaning up intermediate tensors.
    return tf.tidy(() => {
        // Get pixel data from the canvas as a tensor.
        // The '1' indicates we only want one color channel (grayscale).
        const tensor = tf.browser.fromPixels(canvas, 1);
        
        // Normalize the pixel values from [0, 255] to [0.0, 1.0].
        const normalized = tensor.toFloat().div(255.0);
        
        // Add a batch dimension at the beginning, so the shape becomes [1, height, width, 1].
        // This is required by the model.
        return normalized.expandDims(0);
    });
}

/**
 * The main preprocessing pipeline for a given drawing path.
 * @param {Array<Object>} points - The user's drawing path.
 * @param {number} size - The target model input size (e.g., 64 or 28).
 * @returns {tf.Tensor} The final tensor ready for prediction.
 */
export function preprocessDrawing(points, size) {
    const canvas = rasterizePath(points, size);
    
    // For debugging, you can append the canvas to the document body to see what the model sees:
    // canvas.style.border = '1px solid red';
    // document.body.appendChild(canvas);

    return canvasToTensor(canvas);
}