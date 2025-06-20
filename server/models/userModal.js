const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
    },
})

userSchema.statics.signup = async function (name, email, password){
    if(!name || !email || !password){
        throw Error('All fields must be filled');
    }
    if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
        throw Error('Email is not valid');
    }
    if(password.length < 6){
        throw Error('Password must be at least 6 characters long');
    }

    const exists = await this.findOne({ email });
    if(exists){
        throw Error('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ name, email, password: hash });
    return user;
}


userSchema.statics.login = async function (email, password){
    const user = await this.findOne({ email });

    if(!user){
        throw Error('User not found');
    }

    const match = await bcrypt.compare(password, user.password);
    if(!match){
        throw Error('Incorrect password');
    }
    return user;
}



const UserModal = mongoose.model('User',userSchema);

module.exports = UserModal;