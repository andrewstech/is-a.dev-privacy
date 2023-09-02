const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema({
    domain: String,
    email: String,
    id: String,
}, { collection: "Emaildata" })

const Email = mongoose.model('Email', emailSchema)

module.exports = Email