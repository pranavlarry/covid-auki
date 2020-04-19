export default class bookings {
    constructor(id,bookingStatus,appointmentStatus,date,time,businessName) {
        this.id = id;
        this.bookingStatus = bookingStatus;
        this.appointmentStatus = appointmentStatus;
        this.date = date;
        this.time = time;
        this.businessName = businessName;
    }
}