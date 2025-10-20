 // Street Address Class
export default class StreetAddress {
    constructor() {
        this.mrid = null;
        this.streetName = null;
        this.streetNumber = null;
        this.postalCode = null;
        this.townDetail = null;
        this.stateOrProvince = null;
        this.country = null;
    }

    setMRID(mrid) {
        this.mrid = mrid;
    }

    setStreetName(streetName) {
        this.streetName = streetName;
    }

    setStreetNumber(streetNumber) {
        this.streetNumber = streetNumber;
    }

    setPostalCode(postalCode) {
        this.postalCode = postalCode;
    }

    setTownDetail(townDetail) {
        this.townDetail = townDetail;
    }

    setStateOrProvince(stateOrProvince) {
        this.stateOrProvince = stateOrProvince;
    }

    setCountry(country) {
        this.country = country;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            streetName: this.streetName,
            streetNumber: this.streetNumber,
            postalCode: this.postalCode,
            townDetail: this.townDetail,
            stateOrProvince: this.stateOrProvince,
            country: this.country
        };
    }

    static fromJSON(data) {
        const entity = new StreetAddress();
        entity.mrid = data.mrid;
        entity.streetName = data.streetName;
        entity.streetNumber = data.streetNumber;
        entity.postalCode = data.postalCode;
        entity.townDetail = data.townDetail;
        entity.stateOrProvince = data.stateOrProvince;
        entity.country = data.country;
        return entity;
    }
}
