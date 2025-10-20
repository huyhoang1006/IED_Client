// Street Detail Class
export default class StreetDetail {
    constructor() {
        this.mrid = null;
        this.streetName = null;
        this.streetNumber = null;
        this.streetType = null;
        this.streetSuffix = null;
        this.addressGeneral = null;
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

    setStreetType(streetType) {
        this.streetType = streetType;
    }

    setStreetSuffix(streetSuffix) {
        this.streetSuffix = streetSuffix;
    }

    setAddressGeneral(addressGeneral) {
        this.addressGeneral = addressGeneral;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            streetName: this.streetName,
            streetNumber: this.streetNumber,
            streetType: this.streetType,
            streetSuffix: this.streetSuffix,
            addressGeneral: this.addressGeneral
        };
    }

    static fromJSON(data) {
        const entity = new StreetDetail();
        entity.mrid = data.mrid;
        entity.streetName = data.streetName;
        entity.streetNumber = data.streetNumber;
        entity.streetType = data.streetType;
        entity.streetSuffix = data.streetSuffix;
        entity.addressGeneral = data.addressGeneral;
        return entity;
    }
}
