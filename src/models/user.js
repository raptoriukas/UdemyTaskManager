const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(val) {
            if(!validator.isEmail(val)){
                throw new Error('Please provide a valid Email address!');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(val){
            if(val < 0){
                throw new Error('Age must be a positive number');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"...');
            }else if(val.length < 7) {
                throw new Error('Password must contain at least 6 characters...');
            }
        },
        trim: true,

    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});


userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
};

userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;
    return userObj;
};


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email});
    if(!user){
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login(pass)');
    }

    return user
}


//Hash the password before saving
userSchema.pre('save', async function (next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Delete user tasks when user is removed

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});

    next();
});





const User = mongoose.model('User', userSchema);


module.exports = User;
