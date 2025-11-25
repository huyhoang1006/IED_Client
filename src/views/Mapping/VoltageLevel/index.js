import VoltageLevelEntity from "@/views/Entity/VoltageLevel/index.js";
import VoltageLevelDto from "@/views/Dto/VoltageLevel/index.js";

export const volDtoToVolEntity = (volDto) => {
    const entity = new VoltageLevelEntity();

    // Voltage Level
    entity.voltageLevel.name = volDto.name || null;
    entity.voltageLevel.mrid = volDto.voltageLevelId || null;
    entity.voltageLevel.description = volDto.comment || null;
    entity.voltageLevel.high_voltage_limit = volDto.highVoltageLimitId || null;
    entity.voltageLevel.low_voltage_limit = volDto.lowVoltageLimitId || null;
    entity.voltageLevel.base_voltage = volDto.baseVoltageId || null;
    entity.voltageLevel.substation = volDto.substationId || null;
    entity.voltageLevel.location = volDto.locationId || null;
    
    // Add value, unit, multiplier to voltageLevel object for insertVoltageLevelTransaction
    entity.voltageLevel.high_voltage_limit_value = volDto.high_voltage_limit_value || null;
    entity.voltageLevel.high_voltage_limit_unit = volDto.high_voltage_limit_unit || null;
    entity.voltageLevel.high_voltage_limit_multiplier = volDto.high_voltage_limit_multiplier || null;
    
    entity.voltageLevel.low_voltage_limit_value = volDto.low_voltage_limit_value || null;
    entity.voltageLevel.low_voltage_limit_unit = volDto.low_voltage_limit_unit || null;
    entity.voltageLevel.low_voltage_limit_multiplier = volDto.low_voltage_limit_multiplier || null;
    
    entity.voltageLevel.base_voltage_value = volDto.base_voltage_value || null;
    entity.voltageLevel.base_voltage_unit = volDto.base_voltage_unit || null;
    entity.voltageLevel.base_voltage_multiplier = volDto.base_voltage_multiplier || null;

    return entity;
}

export const volEntityToVolDto = (volEntity) => {
    const volDto = new VoltageLevelDto()

    // Check if voltageLevel exists
    if (!volEntity || !volEntity.voltageLevel) {
        console.warn('volEntityToVolDto: volEntity or voltageLevel is missing')
        return volDto
    }

    const voltageLevel = volEntity.voltageLevel

    // VoltageLevel
    volDto.voltageLevelId = voltageLevel.mrid || ''
    volDto.substationId = voltageLevel.substation || ''
    volDto.highVoltageLimitId = voltageLevel.high_voltage_limit || ''
    volDto.lowVoltageLimitId = voltageLevel.low_voltage_limit || ''
    volDto.baseVoltageId = voltageLevel.base_voltage || ''
    volDto.name = voltageLevel.name || ''
    volDto.locationId = voltageLevel.location || ''
    volDto.comment = voltageLevel.description || voltageLevel.comment || ''

    // Get voltage values directly from voltageLevel object (flat structure from DB)
    // These fields are populated by getVoltageLevelById
    volDto.high_voltage_limit_value = voltageLevel.high_voltage_limit_value || ''
    volDto.high_voltage_limit_unit = voltageLevel.high_voltage_limit_unit || ''
    volDto.high_voltage_limit_multiplier = voltageLevel.high_voltage_limit_multiplier || ''
    
    volDto.low_voltage_limit_value = voltageLevel.low_voltage_limit_value || ''
    volDto.low_voltage_limit_unit = voltageLevel.low_voltage_limit_unit || ''
    volDto.low_voltage_limit_multiplier = voltageLevel.low_voltage_limit_multiplier || ''
    
    volDto.base_voltage_value = voltageLevel.base_voltage_value || ''
    volDto.base_voltage_unit = voltageLevel.base_voltage_unit || ''
    volDto.base_voltage_multiplier = voltageLevel.base_voltage_multiplier || ''

    // Set nominalVoltageId from base_voltage (flat structure from DB)
    volDto.nominalVoltageId = voltageLevel.base_voltage || ''

    return volDto;
};

// Alias for consistency with other mappers
export const mapEntityToDto = volEntityToVolDto;
export const mapDtoToEntity = volDtoToVolEntity;