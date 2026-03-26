const fs = require('fs/promises');

// get service model 
const Appointment = require('./../models/appointment-model');
// appointment is an object

const times = {
    '10': '10:00',
    '11': '11:00',
    '12': '12:00',
    '13': '13:00',
    '14': '14:00',
    '15': '15:00',
    '16': '16:00',
    '17': '17:00'
};

exports.displayForm = (req, res) => {
    const time = Object.values(times);
    res.render('appointment', {
        name: '',
        contact: '',
        date: '',
        time,
        selectedTime: '',
        message: [],
        success: ''
    });
};

exports.createAppointment = async (req, res) => {
    const name = req.body.name;
    const contact = req.body.contact.replaceAll(" ", "");
    const date = req.body.date;
    const time = Object.values(times);
    const selectedTime = req.body.time;

    let message = [];
    let success = "";

    if (!name) {
        message.push("Please input a name.");
    }

    if (!contact) {
        message.push("Please input a contact.");
    } else if (!(contact.length === 8 && (contact.startsWith("8") || contact.startsWith("9")))) {
        message.push("Please input a Singapore-based number.");
    }

    if (!date) {
        message.push("Please input a date.");
    }

    if (!selectedTime) {
        message.push("Please select a time.");
    }

    if (message.length > 0) {
        return res.render('appointment', { name, contact, date, time, selectedTime, message, success });
    }

    const newAppointment = {
        name: name,
        contact: contact,
        date: date,
        time: selectedTime
    };

    try {
        await Appointment.addAppointment(newAppointment);

        success = "Appointment confirmed!";
        console.log(success);

        return res.render("appointment", {
            name: '',
            contact: '',
            date: '',
            time,
            selectedTime: '',
            message: [],
            success
        });

    } catch (error) {
        console.error(error);
        return res.send("Error adding appointment");
    }
};

// controller function to get all the documents in the database & display it
exports.showAppointments = async (req, res) => {
    try {
        let appointmentList = await Appointment.retrieveAll();
        console.log(appointmentList);
        res.render("display-appointment", { appointmentList });
    } catch (error) {
        console.log(error);
        res.send("Error reading database");
    }
    };

exports.updateAppointment = async (req, res) => {
    const contactNo = req.body.contact;
    const newDate = req.body.date;
    const newTime = req.body.time;
    try {
        let success = await Appointment.updateAppointment (contactNo, newDate, newTime);
        console.log(success);
        res.send("Appointment has been successfully updated.")
    } catch (error) {
        console.error(error);
        res.send("Error updating appointment")
    }
};

exports.deleteAnAppointment = async (req, res) => {
    const contactNo = req.body.contact;
    try {
        let success = await Appointment.deleteAppointment(contactNo);
        console.log(success) 
        if (success.deletedCount === 1) {
            res.send("Appointment has been successfully deleted")
        } else {
            res.send("Appointment not found")
        }
    } catch (error) {
        console.error(error)
        res.send("Error deleting appointment");
    }
};