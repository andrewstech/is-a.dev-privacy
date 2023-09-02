// Import express
const express = require('express')
//import mongoose from 'mongoose'
const mongoose = require('mongoose')
require("dotenv").config();
const multer = require('multer')
const upload = multer()
const Email = require('./email')
const Senders = require('./senders')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const mongoDB = process.env.MONGO_DB;

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/register', async (req, res) => {
    const domain = req.query.domain
    const email = req.query.email
    let random = Math.random().toString(36).substring(7)
    if (await Email.findOne({ id: random })) {
        random = Math.random().toString(36).substring(7)
    }
    console.log(random)
    const newEmail = new Email({
        domain,
        email,
        id: random
    })
    await newEmail.save()
    return res.json({ EMAIL: `${random}@privacy.is-a.dev`})
})

app.post ('/api/email', upload.none(), async (req, res) => {
    const body = req.body;
  
    console.log(`From: ${body.from}`);
    console.log(`To: ${body.to}`);
    console.log(`Subject: ${body.subject}`);
    console.log(`Text: ${body.text}`);
    const text = body.from;
    const emailRegex = /[\w\.-]+@[\w\.-]+\.[\w\.-]+/;
    // if body to is no-reply@privacy.is-a.dev
    if (!body.to === "no-reply@privacy.is-a.dev") {
        let filteredEmails = body.from.match(emailRegex);
        if (filteredEmails) {
            filteredEmails = filteredEmails[0];
        }
        if (!Senders.findOne({ from: filteredEmails })) {
            console.log("Email is not allowed");
            // send email to sender
            const msg = {
                to: body.from,
                from: 'no-reply@privacy.is-a.dev',
                subject: 'Email could not be delivered',
                text: 'Your email could not be delivered because the recipient is using a privacy email address which only allows emails from is-a.dev staff.'
            };
            sgMail.send(msg);
        }
        else {
            console.log("Email is allowed");
            const id = body.to.split("@")[0];
            const to = await Email.findOne({ id });
            // send email to recipient
            const msg = {
                to: to.email,
                from: 'forwarded@privacy.is-a.dev',
                subject: body.subject,
                text: body.text,
                reply_to: body.from
            };
            sgMail.send(msg);
        }

        }
    
});


mongoose
    .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "is-a-dev-emails" })
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });
app.listen(3000, () => console.log('Server ready'))
