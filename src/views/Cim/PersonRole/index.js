// Person Role Class
export default class PersonRole {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.role = null;
        this.person = null;
        this.organisation = null;
        this.startDate = null;
        this.endDate = null;
    }

    setMRID(mrid) {
        this.mrid = mrid;
    }

    setName(name) {
        this.name = name;
    }

    setDescription(description) {
        this.description = description;
    }

    setRole(role) {
        this.role = role;
    }

    setPerson(person) {
        this.person = person;
    }

    setOrganisation(organisation) {
        this.organisation = organisation;
    }

    setStartDate(startDate) {
        this.startDate = startDate;
    }

    setEndDate(endDate) {
        this.endDate = endDate;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            role: this.role,
            person: this.person,
            organisation: this.organisation,
            startDate: this.startDate,
            endDate: this.endDate
        };
    }

    static fromJSON(data) {
        const entity = new PersonRole();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.role = data.role;
        entity.person = data.person;
        entity.organisation = data.organisation;
        entity.startDate = data.startDate;
        entity.endDate = data.endDate;
        return entity;
    }
}
