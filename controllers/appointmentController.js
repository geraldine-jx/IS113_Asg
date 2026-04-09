const Appointment = require('./../models/appointment');
const PetRequest = require('./../models/petRequest');

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

const getPendingRequest = (req) => { // checks if user has pending adoption or give up
    if (req.session.pendingAdoptionRequest) { // returns the request data, its type and success message 
        // looks for req.session.pendingAdoptionRequest
        // looks for req.session.pendingGiveUpRequest
        return {
            data: req.session.pendingAdoptionRequest,
            type: "Adopt",
            successMessage: "Appointment confirmed and adoption request submitted!"
        };
    }

    if (req.session.pendingGiveUpRequest) {
        return {
            data: req.session.pendingGiveUpRequest,
            type: "Give Up",
            successMessage: "Appointment confirmed and give-up request submitted!"
        };
    }

    return null; // if there is none
};

const clearPendingRequests = (req) => { // deletes requests after being processed
    delete req.session.pendingAdoptionRequest;
    delete req.session.pendingGiveUpRequest; // deletes pending request objects from session
};
// prepares data that gets passed into the appointment ejs page
// first calls getPendingRequest(req) to see if there is a pending adoption/ give up request
const buildAppointmentViewModel = (req, overrides = {}) => { 
    const pendingRequest = getPendingRequest(req);

    return { // overrides if u explicitly pass values in, those values take priority
        // otherwise it falls back to session/ pending default
        name: overrides.name ?? pendingRequest?.data?.ownerName ?? "",
        contact: overrides.contact ?? pendingRequest?.data?.contact ?? "",
        date: overrides.date ?? "",
        time: Object.values(times),
        selectedTime: overrides.selectedTime ?? "",
        type: overrides.type ?? (pendingRequest?.type || ""),
        message: overrides.message ?? (pendingRequest ? [`Confirm this appointment to submit your ${pendingRequest.type === "Adopt" ? "adoption" : "give-up"} request.`] : []),
        success: overrides.success ?? "" // once successful, it clears the boxes for next user
    }; // puts back what u type, so no need type everything when u make a mistake
};

exports.displayForm = (req, res) => { // displays blank appointment form
    res.render('appointment/appointment', buildAppointmentViewModel(req));
};

exports.createAppointment = async (req, res) => { // creates an appointment, saves data into DB 
    const name = req.body.name;
    const contact = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    const date = req.body.date;
    const selectedTime = req.body.time;
    const appointmentType = req.body.appointmentType;
    const pendingRequest = getPendingRequest(req);

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

    if (!appointmentType) {
        message.push("Please select an appointment type.");
    }

    if (pendingRequest && appointmentType && appointmentType !== pendingRequest.type) {
        message.push(`Please select '${pendingRequest.type}' to confirm your pending request.`);
    }

    if (message.length > 0) { // validation step
        return res.render('appointment/appointment', buildAppointmentViewModel(req, {
            name,
            contact,
            date,
            selectedTime,
            type: appointmentType,
            message,
            success
        }));
    }

    const newAppointment = {
        name,
        contact,
        date,
        time: selectedTime,
        appointmentType
    };

    try {
        const appointment = await Appointment.create(newAppointment);

        if (pendingRequest && appointmentType === pendingRequest.type) {
            await PetRequest.create({
                ...pendingRequest.data,
                appointmentId: appointment._id
            });
            clearPendingRequests(req);
            success = pendingRequest.successMessage;
        } else {
            success = "Appointment confirmed!";
        }

        console.log(success);

        return res.render("appointment/appointment", buildAppointmentViewModel(req, {
            name: '',
            contact: '',
            date: '',
            selectedTime: '',
            type: '',
            message: [],
            success
        }));
    } catch (error) {
        console.error(error);
        return res.send("Error adding appointment");
    }
    };

exports.showManageAppointment = async (req, res) => { // renders admin management page
    const time = Object.values(times);
    res.render("appointment/manageappointment", { time, message: [], success: '', existing: null });
};

exports.loadAppointmentForUpdate = async (req, res) => { // to update appt
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    const time = Object.values(times);
    let message = [];
    let success = "";

    if (!contactNo) { // validation by contact number
        message.push("Please input a contact number.");
        return res.render("appointment/manageappointment", { time, message, success, existing: null });
    }

    try { // finding appt by contact number
        const existing = await Appointment.findOne({ contact: contactNo });

        if (!existing) {
            message.push("Appointment not found.");
            return res.render("appointment/manageappointment", { time, message, success, existing: null });
        }

        return res.render("appointment/manageappointment", { time, message: [], success: '', existing });
    } catch (error) {
        console.error(error);
        return res.send("Error finding appointment");
    }
};

exports.updateAppointment = async (req, res) => { // validates and applies changes to existing appt
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    const newDate = req.body.date;
    const newTime = req.body.time;
    const appointmentType = req.body.appointmentType;
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

    if (!appointmentType) {
        message.push("Please select an appointment type.");
    }

    if (message.length > 0) {
        return res.render("appointment/manageappointment", { time, message, success, existing: { contact: contactNo, date: newDate, time: newTime, appointmentType: appointmentType } });
    }

    try {
        let result = await Appointment.updateOne(
            { contact: contactNo },
            { date: newDate, time: newTime, appointmentType }
        );
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

exports.deleteAnAppointment = async (req, res) => { // deletes by contact
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    const time = Object.values(times);

    let message = [];
    let success = "";

    if (!contactNo) {
        message.push("Please input a contact number.");
        return res.render("appointment/manageappointment", { time, message, success, existing: null });
    }

    try {
        let result = await Appointment.deleteOne({ contact: contactNo });
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

exports.showMyAppointmentForm = (req, res) => { // renders the user-facing find my appointment form
    res.render("appointment/findappointment", { appointment: null, message: [] });
};

exports.showMyAppointmentResult = async (req, res) => { // looks up and display
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    let message = [];

    if (!contactNo) {
        message.push("Please input a contact number.");
        return res.render("appointment/findappointment", { appointment: null, message });
    }

    try {
        const appointment = await Appointment.findOne({ contact: contactNo });

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
