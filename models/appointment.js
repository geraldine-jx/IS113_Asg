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

exports.retrieveAll = function() {
    return Appointment.find();
};
exports.findByContact = function(contact) {
    return Appointment.findOne({ contact : contact });
};
exports.addAppointment = function(newAppointment) {
    return Appointment.create(newAppointment);
};
exports.editAppointment = function(contact, date, time, appointmentType) {
    return Appointment.updateOne(
        { contact: contact },
        { date: date, time: time, appointmentType: appointmentType }
    );
};
exports.deleteAppointment = function(contact) {
    return Appointment.deleteOne({ contact:contact });
};
exports.deleteAppointmentById = function(id) {
    return Appointment.deleteOne({ _id: id });
};
exports.deleteAppointmentByContactAndType = function(contact, appointmentType) {
    return Appointment.deleteOne({ contact: contact, appointmentType: appointmentType });
};
