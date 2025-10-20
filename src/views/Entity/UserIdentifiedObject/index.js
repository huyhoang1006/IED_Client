// User Identified Object Entity Class
export default class UserIdentifiedObject {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.createdAt = null;
        this.updatedAt = null;
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

    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }

    setUpdatedAt(updatedAt) {
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        const entity = new UserIdentifiedObject();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.createdAt = data.createdAt;
        entity.updatedAt = data.updatedAt;
        return entity;
    }
}