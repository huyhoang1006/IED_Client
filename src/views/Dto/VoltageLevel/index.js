class VoltageLevelDto {
    constructor() {
        this.voltageLevelId = ''
        this.name = ''
        this.comment = ''

        this.nominal_voltage = null
        this.low_voltage_limit = null
        this.high_voltage_limit = null
        this.substation = null
        this.base_voltage = null

        this.highVoltageLimitId = null
        this.lowVoltageLimitId = null
        this.baseVoltageId = null
        this.substationId = null

        this.high_voltage_limit_value = null
        this.high_voltage_limit_multiplier = null
        this.high_voltage_limit_unit = null
        this.low_voltage_limit_value = null
        this.low_voltage_limit_multiplier = null
        this.low_voltage_limit_unit = null
        this.base_voltage_value = null
        this.base_voltage_multiplier = null
        this.base_voltage_unit = null
    }
}

export default VoltageLevelDto