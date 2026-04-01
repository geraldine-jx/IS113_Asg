const Appointment = require('./../models/appointment');

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
    res.render('appointment/appointment', { name: '', contact: '', date: '', time, selectedTime: '', message: [], success: '' });
};

exports.createAppointment = async (req, res) => {
    const name = req.body.name;
    const contact = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
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
        return res.render('appointment/appointment', { name, contact, date, time, selectedTime, message, success });
    }

    const newAppointment = {
        name,
        contact,
        date,
        time: selectedTime
    };

    try {
        await Appointment.addAppointment(newAppointment);
        success = "Appointment confirmed!";
        console.log(success);

        return res.render("appointment/appointment", { name: '', contact: '', date: '', time, selectedTime: '', message: [], success });
    } catch (error) {
        console.error(error);
        return res.send("Error adding appointment");
    }
};

exports.showManageAppointment = async (req, res) => {
    const time = Object.values(times);
    res.render("appointment/manageappointment", { time, message: [], success: '', existing: null});
};

exports.loadAppointmentForUpdate = async (req, res) => {
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    const time = Object.values(times);
    let message = [];
    let success = "";

    if (!contactNo) {
        message.push("Please input a contact number.");
        return res.render("appointment/manageappointment", {
            time, message, success, existing: null
        });
    }

    try {
        const existing = await Appointment.findByContact(contactNo);

        if (!existing) {
            message.push("Appointment not found.");
            return res.render("appointment/manageappointment", {
                time, message, success, existing: null
            });
        }

        return res.render("appointment/manageappointment", { time, message: [], success: '', existing });
    } catch (error) {
        console.error(error);
        return res.send("Error finding appointment");
    }
};

exports.updateAppointment = async (req, res) => {
    const contactNo = req.body.contact;
    const newDate = req.body.date;
    const newTime = req.body.time;
    const time = Object.values(times);

    let message = [];
    let success = "";

    if (!contactNo) {
        message.push("Please input a contact number.");
    }

    if (!newDate) {
        message.push("Please input a new date.");
    }

    if (!newTime) {
        message.push("Please select a new time.");
    }

    if (message.length > 0) {
        return res.render("appointment/manageappointment", { time, message, success, existing: null });
    }

    try {
        let result = await Appointment.editAppointment(contactNo, newDate, newTime);
        console.log(result);

        if (result.modifiedCount === 1) {
            success = "Appointment has been successfully updated.";
        } else {
            success = "Appointment not found or no changes were made.";
        }

        res.render("appointment/manageappointment", { time, message: [], success, existing: null });
    } catch (error) {
        console.error(error);
        res.send("Error updating appointment");
    }
};

exports.deleteAnAppointment = async (req, res) => {
    const contactNo = req.body.contact;
    const time = Object.values(times);

    let message = [];
    let success = "";

    if (!contactNo) {
        message.push("Please input a contact number.");
        return res.render("appointment/manageappointment", { time, message, success, existing: null });
    }

    try {
        let result = await Appointment.deleteAppointment(contactNo);
        console.log(result);

        if (result.deletedCount === 1) {
            success = "Appointment has been successfully deleted.";
        } else {
            success = "Appointment not found";
        }

        res.render("appointment/manageappointment", { time, message: [], success, existing: null });
    } catch (error) {
        console.error(error);
        res.send("Error deleting appointment");
    }
};

exports.showMyAppointmentForm = (req, res) => {
    res.render("appointment/findappointment", { appointment: null, message: [] });
};

exports.showMyAppointmentResult = async (req, res) => {
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    let message = [];

    if (!contactNo) {
        message.push("Please input a contact number.");
        return res.render("appointment/findappointment", { appointment: null, message });
    }

    try {
        const appointment = await Appointment.findByContact(contactNo);

        if (!appointment) {
            message.push("Appointment not found.");
            return res.render("appointment/findappointment", { appointment: null, message });
        }

        return res.render("appointment/findappointment", { appointment, message: [] });
    } catch (error) {
        console.error(error);
        return res.send("Error finding appointment");
    }
};