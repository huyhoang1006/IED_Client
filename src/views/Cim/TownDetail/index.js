// Town Detail Class
export default class TownDetail {
    constructor() {
        this.mrid = null;
        this.townName = null;
        this.townCode = null;
        this.stateOrProvince = null;
        this.country = null;
        this.postalCode = null;
    }

    setMRID(mrid) {
        this.mrid = mrid;
    }

    setTownName(townName) {
        this.townName = townName;
    }

    setTownCode(townCode) {
        this.townCode = townCode;
    }

    setStateOrProvince(stateOrProvince) {
        this.stateOrProvince = stateOrProvince;
    }

    setCountry(country) {
        this.country = country;
    }

    setPostalCode(postalCode) {
        this.postalCode = postalCode;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            townName: this.townName,
            townCode: this.townCode,
            stateOrProvince: this.stateOrProvince,
            country: this.country,
            postalCode: this.postalCode
        };
    }

    static fromJSON(data) {
        const entity = new TownDetail();
        entity.mrid = data.mrid;
        entity.townName = data.townName;
        entity.townCode = data.townCode;
        entity.stateOrProvince = data.stateOrProvince;
        entity.country = data.country;
        entity.postalCode = data.postalCode;
        return entity;
    }
}
