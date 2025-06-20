const Canvas = require('../models/canvasModel');

const getAllCanvases = async (req, res) => {
   const email  = req.user.email;  

   try {
         const canvases = await Canvas.getAllCanvases(email);
         res.status(200).json(canvases);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

const createCanvas = async (req, res) => {
    const email = req.user.email;
    const { name } = req.body;
    try {
        const newCanvas = await Canvas.createCanvas(email, name);
        res.status(201).json(newCanvas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loadCanvas = async (req, res) => {
    const canvasId = req.params.id;
    const email = req.user.email;

    try {
        const canvas = await Canvas.getCanvasById(canvasId, email); 
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }
        res.status(200).json(canvas);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updatedCanvas = async (req, res) => {
    const email = req.user.email;
    const canvasId = req.params.id;
    const { elements } = req.body;

    console.log('Update request received:', {
        email,
        canvasId,
        canvasIdType: typeof canvasId,
        canvasIdLength: canvasId?.length,
        elementsCount: elements?.length,
        hasElements: !!elements
    });

    if (!canvasId) {
        return res.status(400).json({ message: 'Canvas ID is required' });
    }

    if (!elements) {
        return res.status(400).json({ message: 'Elements array is required' });
    }

    try {
        const canvas = await Canvas.updateCanvas(email, canvasId, elements);
        console.log('Canvas updated successfully:', canvas._id);
        res.status(200).json(canvas);
    } catch (error) {
        console.error('Canvas update failed:', {
            error: error.message,
            email,
            canvasId,
            stack: error.stack
        });
        res.status(500).json({ message: error.message });
    }
}

const deleteCanvas = async (req, res) => {
    const canvasId = req.params.id;
    const email = req.user.email;

    try {
        const canvas = await Canvas.deleteCanvas(email, canvasId);
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }
        res.status(200).json({ message: 'Canvas deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const shareCanvas = async (req, res) => {
    const canvasId = req.params.id;
    const email = req.user.email;
    const { sharedEmail } = req.body;

    try {
        const sharedCanvas = await Canvas.shareCanvas(canvasId, email, sharedEmail);
        if (!sharedCanvas) {
            return res.status(404).json({ message: 'Canvas not found or sharing failed' });
        }
        res.status(200).json(sharedCanvas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAllCanvases , createCanvas, loadCanvas , updatedCanvas, deleteCanvas , shareCanvas };