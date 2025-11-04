import VoltageLevelEntity from '@/views/Entity/VoltageLevel/index'
import VoltageLevelDto from '@/views/Dto/VoltageLevel'

export function mapDtoToEntity(dto) {
    const entity = new VoltageLevelEntity()

    entity.voltageLevel.name = dto.name && dto.name !== '' ? dto.name : (dto.voltageLevelId || dto.mrid || 'VoltageLevel')
    entity.voltageLevel.mrid = dto.voltageLevelId || dto.mrid || null
    entity.voltageLevel.description = dto.comment || null
    
    entity.voltageLevel.low_voltage_limit = dto.lowVoltageLimitId || dto.low_voltage_limit || null
    entity.voltageLevel.high_voltage_limit = dto.highVoltageLimitId || dto.high_voltage_limit || null
    entity.voltageLevel.substation = dto.substationId || dto.substation || null
    entity.voltageLevel.base_voltage = dto.baseVoltageId || dto.base_voltage || null

    entity.voltageLevel.low_voltage_limit_value = dto.low_voltage_limit_value || null
    entity.voltageLevel.low_voltage_limit_multiplier = dto.low_voltage_limit_multiplier || null
    entity.voltageLevel.low_voltage_limit_unit = dto.low_voltage_limit_unit || null
    entity.voltageLevel.high_voltage_limit_value = dto.high_voltage_limit_value || null
    entity.voltageLevel.high_voltage_limit_multiplier = dto.high_voltage_limit_multiplier || null
    entity.voltageLevel.high_voltage_limit_unit = dto.high_voltage_limit_unit || null
    entity.voltageLevel.base_voltage_value = dto.base_voltage_value || null
    entity.voltageLevel.base_voltage_multiplier = dto.base_voltage_multiplier || null
    entity.voltageLevel.base_voltage_unit = dto.base_voltage_unit || null

    return entity
}

export function mapEntityToDto(entity) {
    const dto = new VoltageLevelDto()
    const entityData = entity || {}
    const voltageLevelData = entityData.voltageLevel && entityData.voltageLevel.mrid ? entityData.voltageLevel : entityData

    dto.voltageLevelId = voltageLevelData.mrid || ''
    dto.name = voltageLevelData.name || ''
    dto.comment = voltageLevelData.description || '' 

    dto.low_voltage_limit = voltageLevelData.low_voltage_limit || null
    dto.high_voltage_limit = voltageLevelData.high_voltage_limit || null
    dto.base_voltage = voltageLevelData.base_voltage || null
    dto.substation = voltageLevelData.substation || null
    dto.nominal_voltage = voltageLevelData.nominal_voltage || null

    dto.high_voltage_limit_value = voltageLevelData.high_voltage_limit_value || null
    dto.high_voltage_limit_multiplier = voltageLevelData.high_voltage_limit_multiplier || null
    dto.high_voltage_limit_unit = voltageLevelData.high_voltage_limit_unit || null
    dto.low_voltage_limit_value = voltageLevelData.low_voltage_limit_value || null
    dto.low_voltage_limit_multiplier = voltageLevelData.low_voltage_limit_multiplier || null
    dto.low_voltage_limit_unit = voltageLevelData.low_voltage_limit_unit || null
    dto.base_voltage_value = voltageLevelData.base_voltage_value || null
    dto.base_voltage_multiplier = voltageLevelData.base_voltage_multiplier || null
    dto.base_voltage_unit = voltageLevelData.base_voltage_unit || null

    return dto
}