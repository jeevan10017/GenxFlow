const mongoose = require('mongoose');

// const string ='mongodb+srv://jeevankumarkorra2005:jeevs123@clusternew.wxjdymn.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNew'
const string =  'mongodb://localhost:27017/mydatabase'; // Use environment variable or fallback to local MongoDB

const connectionparams = {
    useNewUrlParser: true, // these are the parameters to avoid warnings
    useUnifiedTopology: true // these are the parameters to avoid warnings
}

const connectDB = async () => {
    try{
        await mongoose.connect(string, connectionparams);
        console.log("MongoDB is connected");
    }
    catch(err){
        console.error("MongoDB connection failed", err);
    }
}

module.exports = connectDB;