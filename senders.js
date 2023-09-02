const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema({
    from: String,
}, { collection: "EmailSenders" })

const Senders = mongoose.model('Email', emailSchema)

module.exports = Senders