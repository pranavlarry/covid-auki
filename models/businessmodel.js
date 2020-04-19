export default class business {
    constructor(id,name,location,personsPerSlot,holidays,timing,slotInterval) {
        this.id = id;
        this.name=name;
        this.location=location;
        this.personsPerSlot=personsPerSlot;
        this.holidays=holidays;
        this.timing = timing;
        this.slotInterval = slotInterval;
    }
}