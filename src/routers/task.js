const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

/*Query Options:
  ?completed=true/false
  ?limit=num ?skip=num
  ?sortBy=creadAt_asc
*/
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {}

    const completed = req.query.completed;

    if(completed === "true" || completed === "false"){
        match.completed = completed === "true";
    }
    if(req.query.sortBy){
        const sortCriteria = req.query.sortBy.split('_');
        sort[sortCriteria[0]] = sortCriteria[1] === 'desc' ? -1 : 1;
    }


    try{
        // const tasks = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send(e);
    }

    
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send(task);
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
})

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }


    
});

router.patch('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id;
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const isValid = updates.every(field => allowedUpdates.includes(field));
    
    if(!isValid){
        return res.status(400).send({error:"Invalid field(s) sent..."});
    }

    try{
        const task = await Task.findOne({_id, owner: req.user._id});

        if(!task){
            return res.status(404).send({error: "Task with this ID was not found"});
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        
        res.send(task);
    }catch(e){
        res.status(400).send(e.message);
    }
});


router.delete('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id;
    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send({error: "Task with this ID was not found"});
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }


});

module.exports = router;