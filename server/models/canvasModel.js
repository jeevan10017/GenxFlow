const mongoose = require('mongoose');
const { Schema } = mongoose;

const CanvasSchema = new Schema(
    {
        owner:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name:{
            type: String,
            required: true,
            trim: true
        },
        elements:{
            type: [{ type: mongoose.Schema.Types.Mixed }],
            default: []
        },
        shared_with:[
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],           
    },
    {
        timestamps: true
    }
);

//get all canvases for a user
CanvasSchema.statics.getAllCanvases = async function (email) {
    try{
        const user = await mongoose.model('User').findOne({ email });
        if(!user){
            throw new Error('User not found');
        }
        const canvases = await this.find({ 
            $or: [{ owner: user._id }, { shared_with: user._id }] 
        }).populate('owner', 'name email');
        return canvases;
    } catch (error) {
        throw new Error(error.message);
    }
};

//create canvas for a user with given email
CanvasSchema.statics.createCanvas = async function (email, name) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const canvas = new this({ 
            owner: user._id, 
            name, 
            elements: [], 
            shared_with: [] 
        });
        const newCanvas = await canvas.save();
        return newCanvas;
    } catch (error) {
        throw new Error("Canvas creation failed: " + error.message);
    }
};

// get canvas by id - FIXED VERSION
CanvasSchema.statics.getCanvasById = async function (canvasId, email) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        const canvas = await this.findOne({ 
            _id: canvasId, 
            $or: [{ owner: user._id }, { shared_with: user._id }] 
        }).populate('owner', 'name email');
        
        if (!canvas) {
            throw new Error('Canvas not found or access denied');
        }
        return canvas;
    } catch (error) {
        throw new Error(error.message);
    }
};

CanvasSchema.statics.updateCanvas = async function (email, canvasId, elements) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        if (!mongoose.Types.ObjectId.isValid(canvasId)) {
            throw new Error('Invalid canvas ID format');
        }

        const canvas = await this.findOne({ 
            _id: canvasId, 
            $or: [{ owner: user._id }, { shared_with: user._id }] 
        });

        if (!canvas) {
            throw new Error('Canvas not found or access denied');
        }

        canvas.elements = elements;
        const updatedCanvas = await canvas.save();
        return updatedCanvas;
        
    } catch (error) {
        console.error('UpdateCanvas error:', error.message);
        throw error; 
    }
}

CanvasSchema.statics.deleteCanvas = async function (email, canvasId) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        await this.findOneAndDelete({ 
            _id: canvasId, 
            owner: user._id 
        });
       
    } catch (error) {
        throw new Error(error.message);
    }
}

CanvasSchema.statics.shareCanvas = async function (canvasId, email, sharedEmail) {
 
        const user = await mongoose.model('User').findOne({ email });
        const sharedWithUser = await mongoose.model('User').findOne({ email: sharedEmail });
    try {
        if (!user) {
            throw new Error('User not found');
        }
        if (!sharedWithUser) {
            throw new Error('Shared user not found');
        }
        

        const canvas = await this.findOne({ 
            _id: canvasId, 
            owner: user._id 
        });

        if (!canvas) {
            throw new Error('Canvas not found or access denied');
        }

        if (canvas.shared_with.includes(sharedWithUser._id)) {
            throw new Error('Canvas already shared with this user');
        }

        canvas.shared_with.push(sharedWithUser._id);
        const updatedCanvas = await canvas.save();
        return updatedCanvas;
        
    } catch (error) {
        throw new Error(error.message);
    }
}

const Canvas = mongoose.model('Canvas', CanvasSchema);
module.exports = Canvas;