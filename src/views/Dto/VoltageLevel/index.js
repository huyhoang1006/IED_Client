// VoltageLevel DTO
export default class VoltageLevelDto {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.nominalVoltage = null;
        this.voltageMultiplier = null;
        this.voltageUnit = null;
        this.baseVoltage = null;
        this.substation = null;
        this.bays = [];
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

    setNominalVoltage(voltage) {
        this.nominalVoltage = voltage;
    }

    setVoltageMultiplier(multiplier) {
        this.voltageMultiplier = multiplier;
    }

    setVoltageUnit(unit) {
        this.voltageUnit = unit;
    }

    setBaseVoltage(baseVoltage) {
        this.baseVoltage = baseVoltage;
    }

    setSubstation(substation) {
        this.substation = substation;
    }

    addBay(bay) {
        this.bays.push(bay);
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            nominalVoltage: this.nominalVoltage,
            voltageMultiplier: this.voltageMultiplier,
            voltageUnit: this.voltageUnit,
            baseVoltage: this.baseVoltage,
            substation: this.substation,
            bays: this.bays,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        const dto = new VoltageLevelDto();
        dto.mrid = data.mrid;
        dto.name = data.name;
        dto.description = data.description;
        dto.nominalVoltage = data.nominalVoltage;
        dto.voltageMultiplier = data.voltageMultiplier;
        dto.voltageUnit = data.voltageUnit;
        dto.baseVoltage = data.baseVoltage;
        dto.substation = data.substation;
        dto.bays = data.bays || [];
        dto.createdAt = data.createdAt;
        dto.updatedAt = data.updatedAt;
        return dto;
    }
}
