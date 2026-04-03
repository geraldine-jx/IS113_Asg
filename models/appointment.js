const mongoose = require('mongoose'); // from server.js

const appointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An appointment must have a name']
    },
    contact: {
        type: String,
        required: [true, 'An appointment must have a contact']
    },
    date: {
        type: String,
        required: [true, 'An appointment must have a date']
    },
    time: {
        type: String,
        required: [true, 'An appointment must have a time']
    },
    appointmentType: {
        type: String,
        required: [true, 'An appointment must have a type'],
        enum: ['Adopt', 'Give Up']
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema, 'appointments');

module.exports = Appointment;
