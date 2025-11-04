class VoltageLevelEntity {
    constructor() {
        this.voltageLevel = {
            mrid: null,
            name: null,
            description: null,
            low_voltage_limit: null,
            high_voltage_limit: null,
            base_voltage: null,
            substation: null,

            low_voltage_limit_value: null,
            low_voltage_limit_multiplier: null,
            low_voltage_limit_unit: null,
            high_voltage_limit_value: null,
            high_voltage_limit_multiplier: null,
            high_voltage_limit_unit: null,
            base_voltage_value: null,
            base_voltage_multiplier: null,
            base_voltage_unit: null
        }
    }
}

export default VoltageLevelEntity
