// Measurement Procedure Class
export default class MeasurementProcedure {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.testMethod = null;
        this.standard = null;
        this.conditions = null;
        this.equipment = null;
        this.results = [];
        this.procedure_id = null;
        this.measurement_id = null;
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

    setTestMethod(testMethod) {
        this.testMethod = testMethod;
    }

    setStandard(standard) {
        this.standard = standard;
    }

    setConditions(conditions) {
        this.conditions = conditions;
    }

    setEquipment(equipment) {
        this.equipment = equipment;
    }

    setProcedureId(procedure_id) {
        this.procedure_id = procedure_id;
    }

    setMeasurementId(measurement_id) {
        this.measurement_id = measurement_id;
    }

    addResult(result) {
        this.results.push(result);
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            testMethod: this.testMethod,
            standard: this.standard,
            conditions: this.conditions,
            equipment: this.equipment,
            results: this.results,
            procedure_id: this.procedure_id,
            measurement_id: this.measurement_id
        };
    }

    static fromJSON(data) {
        const entity = new MeasurementProcedure();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.testMethod = data.testMethod;
        entity.standard = data.standard;
        entity.conditions = data.conditions;
        entity.equipment = data.equipment;
        entity.results = data.results || [];
        entity.procedure_id = data.procedure_id;
        entity.measurement_id = data.measurement_id;
        return entity;
    }
}
