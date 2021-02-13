const sgMail = require('@sendgrid/mail');
const apiKey = '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';


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sgMail.send({
//     to: 'arnoldassalcius@gmail.com',
//     from: 'arnoldassalcius1@gmail.com',
//     subject: 'This is my first creation',
//     text: 'I hope you get this one too!'
// });

const sendWelcome = (email, name) => {

    sgMail.send({
        to: email,
        from: 'arnoldassalcius1@gmail.com',
        subject: 'Welcome to the App',
        text: `Welcome to my App. Thanks for signing up, ${name}`
    });
}

const sendCancel = (email, name) => {
    sgMail.send({
        to: email,
        from: 'arnoldassalcius1@gmail.com',
        subject: 'Your account has been removed!',
        text: `We are sad to see you go. You are welcome to come back anytime, ${name}. Please feel free to send us an email telling us what made you cancel and how to improve`
    });
}




module.exports = {
    sendWelcome,
    sendCancel
}