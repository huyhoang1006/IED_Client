// Electronic Address Class
export default class ElectronicAddress {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.email = null;
        this.website = null;
        this.phone = null;
        this.fax = null;
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

    setEmail(email) {
        this.email = email;
    }

    setWebsite(website) {
        this.website = website;
    }

    setPhone(phone) {
        this.phone = phone;
    }

    setFax(fax) {
        this.fax = fax;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            email: this.email,
            website: this.website,
            phone: this.phone,
            fax: this.fax
        };
    }

    static fromJSON(data) {
        const entity = new ElectronicAddress();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.email = data.email;
        entity.website = data.website;
        entity.phone = data.phone;
        entity.fax = data.fax;
        return entity;
    }
}
