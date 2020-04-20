export default class bookings {
    constructor(id,bookingStatus,appointmentStatus,date,time,businessName,businessId) {
        this.id = id;
        this.bookingStatus = bookingStatus;
        this.appointmentStatus = appointmentStatus;
        this.date = date;
        this.time = time;
        this.businessName = businessName;
        this.businessId = businessId
    }
}