const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Succesfully connected to MongoDB using Mongoose!");
}).catch(err => {
    console.log(err);
});







