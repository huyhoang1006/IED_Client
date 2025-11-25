import { UnitMultiplier } from "@/views/Enum/UnitMultiplier.js"
import { UnitSymbol } from "@/views/Enum/UnitSymbol.js"
class VoltageLevelDto {
    constructor() {
        this.high_voltage_limit_value = ''
        this.high_voltage_limit_unit = UnitSymbol.V
        this.high_voltage_limit_multiplier = UnitMultiplier.K
        this.low_voltage_limit_value = ''
        this.low_voltage_limit_unit = UnitSymbol.V
        this.low_voltage_limit_multiplier = UnitMultiplier.K
        this.base_voltage_value = ''
        this.base_voltage_unit = UnitSymbol.V
        this.base_voltage_multiplier = UnitMultiplier.K
        this.name = ''
        this.comment = ''
        this.substationId = ''
        this.baseVoltageId = ''
        this.voltageLevelId = ''
        this.highVoltageLimitId = ''
        this.lowVoltageLimitId = ''
        this.nominalVoltageId = ''
        this.locationId = ''
    }
}

export default VoltageLevelDto;