// Equipment Container Base Class
export default class EquipmentContainer {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.aliasName = null;
        this.assetInfo = null;
        this.location = null;
        this.containers = [];
        this.equipments = [];
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

    setAliasName(aliasName) {
        this.aliasName = aliasName;
    }

    setAssetInfo(assetInfo) {
        this.assetInfo = assetInfo;
    }

    setLocation(location) {
        this.location = location;
    }

    addContainer(container) {
        this.containers.push(container);
    }

    addEquipment(equipment) {
        this.equipments.push(equipment);
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            aliasName: this.aliasName,
            assetInfo: this.assetInfo,
            location: this.location,
            containers: this.containers,
            equipments: this.equipments
        };
    }

    static fromJSON(data) {
        const entity = new EquipmentContainer();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.aliasName = data.aliasName;
        entity.assetInfo = data.assetInfo;
        entity.location = data.location;
        entity.containers = data.containers || [];
        entity.equipments = data.equipments || [];
        return entity;
    }
}
