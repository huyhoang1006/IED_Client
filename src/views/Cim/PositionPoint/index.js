// Position Point Class
export default class PositionPoint {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.xPosition = null;
        this.yPosition = null;
        this.zPosition = null;
        this.sequenceNumber = null;
        this.location = null;
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

    setXPosition(xPosition) {
        this.xPosition = xPosition;
    }

    setYPosition(yPosition) {
        this.yPosition = yPosition;
    }

    setZPosition(zPosition) {
        this.zPosition = zPosition;
    }

    setSequenceNumber(sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    setLocation(location) {
        this.location = location;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            xPosition: this.xPosition,
            yPosition: this.yPosition,
            zPosition: this.zPosition,
            sequenceNumber: this.sequenceNumber,
            location: this.location
        };
    }

    static fromJSON(data) {
        const entity = new PositionPoint();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.xPosition = data.xPosition;
        entity.yPosition = data.yPosition;
        entity.zPosition = data.zPosition;
        entity.sequenceNumber = data.sequenceNumber;
        entity.location = data.location;
        return entity;
    }
}
