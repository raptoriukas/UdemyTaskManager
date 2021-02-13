const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcome, sendCancel} = require('../emails/account');

const router = express.Router();
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: function(req, file, cb){
        const myRegex = /\.(jpg|jpeg|png)$/;
        if(!file.originalname.match(myRegex) && !file.mimetype.match(myRegex)){
            return cb(new Error("Please upload an Image file..."));
        }
        
        cb(undefined, true);

    }
});



router.get('/users/me', auth, async (req, res) => {
    // try{
    //     const users = await User.find({});
    //     res.send(users);
    // }catch(e){
    //     res.status(500).send(e);
    // }

    res.send(req.user);
    
});




router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try{
        const savedUser = await user.save();
        sendWelcome(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({savedUser, token});
    }catch(e){
        res.status(400).send(e);
    }
    
    // user.save().then(()=> {
    //     res.status(201).send(user);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // });
});

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }catch(e){
        res.status(400).send();
    }
});


router.post('/users/logout', auth, async(req, res) => {

    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }

});

router.post('/users/logoutall', auth, async(req, res) =>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async(req, res) => {
  
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    const isValid = updates.every(field => allowedUpdates.includes(field));
    if(!isValid){
        return res.status(400).send({error: "Invalid field(s) sent..."});
    }

    try{

        updates.forEach(update => {
            req.user[update] = req.body[update];
        });

        await req.user.save();      
        res.status(200).send(req.user);

    }catch(e){
        res.status(400).send(e.message);
    }
});

router.delete('/users/me', auth, async (req, res) => {

    try{
        await req.user.remove();
        sendCancel(req.user.email, req.user.name);

        res.send(req.user);
    }catch(e){
        res.status(500).send(e);
    }
});



router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const sharpBuffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = sharpBuffer;
    await req.user.save();
    res.send();

}, (err, req, res, next) => {

    res.status(400).send({error: err.message});

});


router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({success: "Avatar Deleted"});

});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

            res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
});

router.get('/users/free', (req, res) => {
    User.find({}).then(users => {
        res.send(users);
    }).catch(e => res.send({error: e.message}));
});
module.exports = router;
