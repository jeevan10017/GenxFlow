const mongoose = require('mongoose');
require('dotenv').config();


const connectionparams = {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, connectionparams);
        console.log("MongoDB is connected");
    }
    catch(err){
        console.error("MongoDB connection failed", err);
    }
}

module.exports = connectDB;