export default class business {
    constructor(id,name,location,details,personsPerSlot,timeSlots,holidays,bookings) {
        this.id = id;
        this.name=name;
        this.location=location;
        this.details=details;
        this.personsPerSlot=personsPerSlot;
        this.timeSlots=timeSlots;
        this.holidays=holidays;
        this.bookings=bookings
    }
}