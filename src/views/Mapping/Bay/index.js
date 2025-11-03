/* eslint-disable */
import BayEntity from '@/views/Entity/Bay/index'
import BayDto from '@/views/Dto/Bay'
export function mapDtoToEntity(dto) {
    const entity = new BayEntity()

    entity.bay.name = dto.name || null
    entity.bay.mrid = dto.bayId || null
    
    entity.bay.breaker_configuration = dto.breaker_configuration || null
    entity.bay.bus_bar_configuration = dto.bus_bar_configuration || null
    entity.bay.substation = dto.substation || null
    entity.bay.voltage_level = dto.voltage_level || null

    return entity
}

export function mapEntityToDto(entity) {
    const dto = new BayDto()
    const entityData = entity || {}
    const bayData = entityData.bay && entityData.bay.mrid ? entityData.bay : entityData

    dto.bayId = bayData.mrid || ''
    dto.name = bayData.name || ''

    dto.breaker_configuration = bayData.breaker_configuration || null
    dto.bus_bar_configuration = bayData.bus_bar_configuration || null
    dto.substation = bayData.substation || null
    dto.voltage_level = bayData.voltage_level || null

    return dto
}
