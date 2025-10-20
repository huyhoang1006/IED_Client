// Location Class
export default class Location {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.latitude = null;
        this.longitude = null;
        this.elevation = null;
        this.coordinateSystem = null;
        this.orientation = null;
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

    setLatitude(latitude) {
        this.latitude = latitude;
    }

    setLongitude(longitude) {
        this.longitude = longitude;
    }

    setElevation(elevation) {
        this.elevation = elevation;
    }

    setCoordinateSystem(coordinateSystem) {
        this.coordinateSystem = coordinateSystem;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            latitude: this.latitude,
            longitude: this.longitude,
            elevation: this.elevation,
            coordinateSystem: this.coordinateSystem,
            orientation: this.orientation
        };
    }

    static fromJSON(data) {
        const entity = new Location();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.latitude = data.latitude;
        entity.longitude = data.longitude;
        entity.elevation = data.elevation;
        entity.coordinateSystem = data.coordinateSystem;
        entity.orientation = data.orientation;
        return entity;
    }
}
