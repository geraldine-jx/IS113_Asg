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

const getPendingRequest = (req) => {
    if (req.session.pendingAdoptionRequest) {
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

    return null;
};

const clearPendingRequests = (req) => {
    delete req.session.pendingAdoptionRequest;
    delete req.session.pendingGiveUpRequest;
};

const buildAppointmentViewModel = (req, overrides = {}) => {
    const pendingRequest = getPendingRequest(req);

    return {
        name: overrides.name ?? pendingRequest?.data?.ownerName ?? "",
        contact: overrides.contact ?? pendingRequest?.data?.contact ?? "",
        date: overrides.date ?? "",
        time: Object.values(times),
        selectedTime: overrides.selectedTime ?? "",
        type: overrides.type ?? (pendingRequest?.type || ""),
        message: overrides.message ?? (pendingRequest ? [`Confirm this appointment to submit your ${pendingRequest.type === "Adopt" ? "adoption" : "give-up"} request.`] : []),
        success: overrides.success ?? ""
    };
};

exports.displayForm = (req, res) => {
    res.render('appointment/appointment', buildAppointmentViewModel(req));
};

exports.createAppointment = async (req, res) => {
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

    if (message.length > 0) {
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

exports.showManageAppointment = async (req, res) => {
    const time = Object.values(times);
    res.render("appointment/manageappointment", { time, message: [], success: '', existing: null });
};

exports.loadAppointmentForUpdate = async (req, res) => {
    const contactNo = req.body.contact ? req.body.contact.replaceAll(" ", "") : "";
    const time = Object.values(times);
    let message = [];
    let success = "";

    if (!contactNo) {
        message.push("Please input a contact number.");
        return res.render("appointment/manageappointment", { time, message, success, existing: null });
    }

    try {
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

exports.updateAppointment = async (req, res) => {
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

exports.deleteAnAppointment = async (req, res) => {
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
