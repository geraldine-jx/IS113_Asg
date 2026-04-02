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

const buildAppointmentViewModel = (req, overrides = {}) => {
    const pendingGiveUpRequest = req.session.pendingGiveUpRequest || null;

    return {
        name: overrides.name ?? pendingGiveUpRequest?.ownerName ?? "",
        contact: overrides.contact ?? pendingGiveUpRequest?.contact ?? "",
        date: overrides.date ?? "",
        time: Object.values(times),
        selectedTime: overrides.selectedTime ?? "",
        type: overrides.type ?? (pendingGiveUpRequest ? "Give Up" : ""),
        message: overrides.message ?? (pendingGiveUpRequest ? ["Confirm this appointment to submit your give-up request."] : []),
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
    const pendingGiveUpRequest = req.session.pendingGiveUpRequest || null;

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

    if (pendingGiveUpRequest && appointmentType && appointmentType !== "Give Up") {
        message.push("Please select 'Give Up' to confirm your rehome request.");
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
        const createdAppointment = await Appointment.addAppointment(newAppointment);

        if (pendingGiveUpRequest && appointmentType === "Give Up") {
            try {
                await PetRequest.create(pendingGiveUpRequest);
                delete req.session.pendingGiveUpRequest;
                success = "Appointment confirmed and give-up request submitted!";
            } catch (requestError) {
                await Appointment.deleteAppointmentById(createdAppointment._id);
                throw requestError;
            }
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
        const existing = await Appointment.findByContact(contactNo);

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
        let result = await Appointment.editAppointment(contactNo, newDate, newTime, appointmentType);
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
