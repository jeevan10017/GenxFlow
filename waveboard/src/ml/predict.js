
import * as tf from '@tensorflow/tfjs';
import { preprocessDrawing } from './preprocess';

// Module-level variables to hold the loaded models and labels
let shapeModel, alphabetModel, shapeLabels, alphabetLabels;
// We'll only accept predictions that are above this confidence level.
const CONFIDENCE_THRESHOLD = 0.75;

/**
 * Loads both ML models and their corresponding labels from the /public directory.
 * This function should be called once when the application starts.
 */
export async function loadModels() {
    try {
        // Use a Promise.all to load everything in parallel for speed.
        if (!shapeModel) {
            console.log("Loading ML models and labels...");
            [shapeModel, alphabetModel, shapeLabels, alphabetLabels] = await Promise.all([
                tf.loadLayersModel('/ml/shapeModel/model.json'),
                tf.loadLayersModel('/ml/alphabetModel/model.json'),
                fetch('/ml/labels/shapes.json').then(res => res.json()),
                fetch('/ml/labels/alphabet.json').then(res => res.json())
            ]);
            console.log("All models and labels loaded successfully.");
        }
    } catch (error) {
        console.error("Error loading ML models:", error);
    }
}

/**
 * Analyzes a drawing based on a specific mode (shape or alphabet).
 * @param {Array<Object>} points - The user's raw drawing path.
 * @param {string} mode - The prediction mode: 'shape' or 'alphabet'.
 * @returns {Object|null} An object like {type: 'shape', label: 'circle'} or null.
 */
export function predictDrawing(points, mode) {
    if (!shapeModel || !alphabetModel) {
        console.warn("Models are not loaded yet. Cannot run prediction.");
        return null;
    }

    if (mode === 'shape') {
        const shapeTensor = preprocessDrawing(points, 64);
        const shapePrediction = shapeModel.predict(shapeTensor);
        const shapeProbs = shapePrediction.dataSync();
        tf.dispose([shapeTensor, shapePrediction]);

        const topShapeIndex = shapeProbs.indexOf(Math.max(...shapeProbs));
        const topShapeConfidence = shapeProbs[topShapeIndex];

        if (topShapeConfidence > CONFIDENCE_THRESHOLD) {
            return { type: 'shape', label: shapeLabels[topShapeIndex], confidence: topShapeConfidence };
        }
    } else if (mode === 'alphabet') {
        const alphabetTensor = preprocessDrawing(points, 28);
        const alphabetPrediction = alphabetModel.predict(alphabetTensor);
        const alphabetProbs = alphabetPrediction.dataSync();
        tf.dispose([alphabetTensor, alphabetPrediction]);

        const topAlphabetIndex = alphabetProbs.indexOf(Math.max(...alphabetProbs));
        const topAlphabetConfidence = alphabetProbs[topAlphabetIndex];

        if (topAlphabetConfidence > CONFIDENCE_THRESHOLD) {
            return { type: 'alphabet', label: alphabetLabels[topAlphabetIndex], confidence: topAlphabetConfidence };
        }
    }

    return null; 
}