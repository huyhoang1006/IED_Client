// Telephone Number Class
export default class TelephoneNumber {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.phoneNumber = null;
        this.phoneType = null;
        this.countryCode = null;
        this.areaCode = null;
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

    setPhoneNumber(phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    setPhoneType(phoneType) {
        this.phoneType = phoneType;
    }

    setCountryCode(countryCode) {
        this.countryCode = countryCode;
    }

    setAreaCode(areaCode) {
        this.areaCode = areaCode;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            phoneNumber: this.phoneNumber,
            phoneType: this.phoneType,
            countryCode: this.countryCode,
            areaCode: this.areaCode
        };
    }

    static fromJSON(data) {
        const entity = new TelephoneNumber();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.phoneNumber = data.phoneNumber;
        entity.phoneType = data.phoneType;
        entity.countryCode = data.countryCode;
        entity.areaCode = data.areaCode;
        return entity;
    }
}
