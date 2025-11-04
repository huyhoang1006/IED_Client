/* eslint-disable */
import OrganisationEntity from '@/views/Entity/Organisation/index'
import OrganisationDto from '@/views/Dto/Organisation'
import PositionPoint from '@/views/Cim/PositionPoint/index.js'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent/index.js'

export function mapDtoToEntity(dto) {
    const entity = new OrganisationEntity()

    // Map các trường đơn giản từ Organisation
    entity.organisation.name = dto.name || null
    entity.organisation.description = dto.comment || null
    entity.organisation.mrid = dto.organisationId || dto.mrid || null
    entity.organisation.location = dto.locationId || null
    
    // Organisation specific fields
    entity.organisation.ref_id = dto.tax_code || null
    entity.organisation.address = dto.street || null
    entity.organisation.city = dto.city || null
    entity.organisation.state = dto.state_or_province || null
    entity.organisation.country = dto.country || null
    entity.organisation.phone_no = dto.phoneNumber || null
    entity.organisation.fax = dto.fax || null
    entity.organisation.email = dto.email || null
    entity.organisation.mode = dto.mode || 'organisation'
    entity.organisation.department = dto.district_or_town || null
    entity.organisation.position = dto.ward_or_commune || null

    // PSR Type
    entity.psrType.name = dto.type || null
    entity.psrType.mrid = dto.psrTypeId || null
    entity.organisation.psr_type_id = dto.psrTypeId || null
    
    // PsrType additional fields
    entity.psrType.description = dto.psrTypeDescription || null
    entity.psrType.type = dto.psrTypeType || null
    entity.psrType.category = dto.category || null
    entity.psrType.subCategory = dto.subCategory || null

    // TownDetail
    entity.townDetail.mrid = dto.townDetailId || null
    entity.townDetail.city = dto.city || null
    entity.townDetail.state_or_province = dto.state_or_province || null
    entity.townDetail.country = dto.country || null
    entity.townDetail.district_or_town = dto.district_or_town || null
    entity.townDetail.ward_or_commune = dto.ward_or_commune || null

    // StreetDetail
    entity.streetDetail.address_general = dto.street || null
    entity.streetDetail.mrid = dto.streetDetailId || null

    // StreetAddress
    entity.streetAddress.street_detail = dto.streetDetailId || null
    entity.streetAddress.town_detail = dto.townDetailId || null
    entity.streetAddress.mrid = dto.streetAddressId || null

    // Location
    entity.location.mrid = dto.locationId || null
    entity.location.name = dto.locationName || null
    entity.location.main_address = dto.streetAddressId || null
    
    // Location additional fields
    entity.location.description = dto.locationDescription || null
    entity.location.latitude = dto.latitude || null
    entity.location.longitude = dto.longitude || null
    entity.location.elevation = dto.elevation || null
    entity.location.coordinateSystem = dto.coordinateSystem || null
    entity.location.orientation = dto.orientation || null

    // ElectronicAddress
    entity.electronicAddress.mrid = dto.electronicAddressId || null
    entity.electronicAddress.email = dto.email || null
    entity.electronicAddress.fax = dto.fax || null
    
    // ElectronicAddress additional fields
    entity.electronicAddress.name = dto.electronicAddressName || null
    entity.electronicAddress.description = dto.electronicAddressDescription || null
    entity.electronicAddress.website = dto.website || null
    entity.electronicAddress.phone = dto.electronicPhone || null

    // TelephoneNumber
    entity.telephoneNumber.mrid = dto.telephoneNumberId || null
    entity.telephoneNumber.itu_phone = dto.phoneNumber || null
    
    // TelephoneNumber additional fields
    entity.telephoneNumber.name = dto.telephoneName || null
    entity.telephoneNumber.description = dto.telephoneDescription || null
    entity.telephoneNumber.phoneType = dto.phoneType || null
    entity.telephoneNumber.countryCode = dto.countryCode || null
    entity.telephoneNumber.areaCode = dto.areaCode || null

    // Person
    entity.person.mrid = dto.personId || null
    entity.person.name = dto.personName || null
    entity.person.electronic_address = dto.electronicAddressId || null
    entity.person.mobile_phone = dto.telephoneNumberId || null
    entity.person.roles = dto.personRoleId || null
    
    // Person additional fields
    entity.person.description = dto.personDescription || null
    entity.person.firstName = dto.firstName || null
    entity.person.lastName = dto.lastName || null
    entity.person.middleName = dto.middleName || null
    entity.person.title = dto.title || null
    entity.person.gender = dto.gender || null
    entity.person.birthDate = dto.birthDate || null
    entity.person.nationality = dto.nationality || null

    // PersonRole
    entity.personRole.mrid = dto.personRoleId || null
    entity.personRole.department = dto.department || null
    entity.personRole.position = dto.position || null
    entity.personRole.person = dto.personId || null
    
    // PersonRole additional fields
    entity.personRole.name = dto.roleName || null
    entity.personRole.description = dto.roleDescription || null
    entity.personRole.role = dto.role || null
    entity.personRole.organisation = dto.organisationId || null
    entity.personRole.startDate = dto.startDate || null
    entity.personRole.endDate = dto.endDate || null

    // Map attachment
    entity.attachment.id = dto.attachmentId || null
    entity.attachment = dto.attachment || null

    // Position points
    if(dto.positionPoints && dto.positionPoints.x && dto.positionPoints.x.length !== 0) {
        dto.positionPoints.x.forEach((element, index) => {
            const positionPoint = new PositionPoint()
            positionPoint.location = dto.locationId || null
            positionPoint.mrid = element.id || null
            positionPoint.x_position = element.coor || null
            positionPoint.y_position = dto.positionPoints.y[index]?.coor || null
            positionPoint.z_position = dto.positionPoints.z[index]?.coor || null
            entity.positionPoint.push(positionPoint)
        });
    }

    // User
    entity.user.user_id = dto.userId || null
    entity.user.username = dto.userName || null

    // UserIdentifiedObject
    entity.userIdentifiedObject.mrid = dto.userIdentifiedObjectId || null
    entity.userIdentifiedObject.identified_object_id = dto.organisationId || null
    entity.userIdentifiedObject.user_id = dto.userId || null

    // PersonOrganisation
    entity.personOrganisation.mrid = dto.personOrganisationId || null
    entity.personOrganisation.organisation_id = dto.organisationId || null
    entity.personOrganisation.person_id = dto.personId || null

    // OrganisationLocation
    entity.organisationLocation.mrid = dto.organisationLocationId || null
    entity.organisationLocation.organisation_id = dto.organisationId || null
    entity.organisationLocation.location_id = dto.locationId || null

    // OrganisationPerson
    entity.organisationPerson.mrid = dto.organisationPersonId || null
    entity.organisationPerson.organisation_id = dto.organisationId || null
    entity.organisationPerson.person_id = dto.personId || null

    // OrganisationPsr
    entity.organisationPsr.mrid = dto.organisationPsrId || null
    entity.organisationPsr.organisation_id = dto.organisationId || null
    entity.organisationPsr.psr_id = dto.organisationId || null
    
    // ConfigurationEvent
    if (Array.isArray(dto.configurationEvent) && dto.configurationEvent.length > 0) {
        entity.configurationEvent = dto.configurationEvent
    }
    
    return entity
}

export function mapEntityToDto(entity) {
    const dto = new OrganisationDto()

    // Organisation
    dto.name = entity.organisation.name || ''
    dto.comment = entity.organisation.description || ''
    dto.organisationId = entity.organisation.mrid || ''
    
    // Organisation specific fields
    dto.tax_code = entity.organisation.ref_id || ''
    dto.street = entity.organisation.address || ''
    dto.city = entity.organisation.city || ''
    dto.state_or_province = entity.organisation.state || ''
    dto.country = entity.organisation.country || ''
    dto.phoneNumber = entity.organisation.phone_no || ''
    dto.fax = entity.organisation.fax || ''
    dto.email = entity.organisation.email || ''
    dto.mode = entity.organisation.mode || 'organisation'
    dto.district_or_town = entity.organisation.department || ''
    dto.ward_or_commune = entity.organisation.position || ''

    // StreetAddress
    dto.streetAddressId = entity.streetAddress.mrid || ""

    // TownDetail
    dto.townDetailId = entity.townDetail.mrid || ""
    dto.city = entity.townDetail.city || ""
    dto.state_or_province = entity.townDetail.state_or_province || ""
    dto.country = entity.townDetail.country || ""
    dto.district_or_town = entity.townDetail.district_or_town || ""
    dto.ward_or_commune = entity.townDetail.ward_or_commune || ""

    // StreetDetail
    dto.streetDetailId = entity.streetDetail.mrid || ""
    dto.street = entity.streetDetail.address_general || ""

    // Location
    dto.locationId = entity.location.mrid || ""
    dto.locationName = entity.location.name || ""
    
    // Location additional fields
    dto.locationDescription = entity.location.description || ""
    dto.latitude = entity.location.latitude || null
    dto.longitude = entity.location.longitude || null
    dto.elevation = entity.location.elevation || null
    dto.coordinateSystem = entity.location.coordinateSystem || null
    dto.orientation = entity.location.orientation || null

    // ElectronicAddress
    dto.electronicAddressId = entity.electronicAddress.mrid || ""
    dto.email = entity.electronicAddress.email || ""
    dto.fax = entity.electronicAddress.fax || ""
    
    // ElectronicAddress additional fields
    dto.electronicAddressName = entity.electronicAddress.name || ""
    dto.electronicAddressDescription = entity.electronicAddress.description || ""
    dto.website = entity.electronicAddress.website || ""
    dto.electronicPhone = entity.electronicAddress.phone || ""

    // TelephoneNumber
    dto.telephoneNumberId = entity.telephoneNumber.mrid || ""
    dto.phoneNumber = entity.telephoneNumber.itu_phone || ""
    
    // TelephoneNumber additional fields
    dto.telephoneName = entity.telephoneNumber.name || ""
    dto.telephoneDescription = entity.telephoneNumber.description || ""
    dto.phoneType = entity.telephoneNumber.phoneType || ""
    dto.countryCode = entity.telephoneNumber.countryCode || ""
    dto.areaCode = entity.telephoneNumber.areaCode || ""

    // PSR Type
    dto.psrTypeId = entity.psrType.mrid || ""
    dto.type = entity.psrType.name || ""
    
    // PsrType additional fields
    dto.psrTypeDescription = entity.psrType.description || ""
    dto.psrTypeType = entity.psrType.type || ""
    dto.category = entity.psrType.category || ""
    dto.subCategory = entity.psrType.subCategory || ""

    // Person
    dto.personId = entity.person.mrid || ""
    dto.personName = entity.person.name || ""
    
    // Person additional fields
    dto.personDescription = entity.person.description || ""
    dto.firstName = entity.person.firstName || ""
    dto.lastName = entity.person.lastName || ""
    dto.middleName = entity.person.middleName || ""
    dto.title = entity.person.title || ""
    dto.gender = entity.person.gender || ""
    dto.birthDate = entity.person.birthDate || null
    dto.nationality = entity.person.nationality || ""

    // PersonRole
    dto.personRoleId = entity.personRole.mrid || ""
    dto.department = entity.personRole.department || ""
    dto.position = entity.personRole.position || ""
    
    // PersonRole additional fields
    dto.roleName = entity.personRole.name || ""
    dto.roleDescription = entity.personRole.description || ""
    dto.role = entity.personRole.role || ""
    dto.startDate = entity.personRole.startDate || null
    dto.endDate = entity.personRole.endDate || null

    // Attachment
    dto.attachmentId = entity.attachment.id || ""
    dto.attachment = entity.attachment || ""

    // PositionPoints
    dto.positionPoints = { x: [], y: [], z: [] }
    if (Array.isArray(entity.positionPoint)) {
        entity.positionPoint.forEach(point => {
            dto.positionPoints.x.push({ id: point.mrid, coor: point.x_position })
            dto.positionPoints.y.push({ id: point.mrid, coor: point.y_position })
            dto.positionPoints.z.push({ id: point.mrid, coor: point.z_position })
        })
    }

    // User
    dto.userId = entity.user.user_id || ""

    // UserIdentifiedObject
    dto.userIdentifiedObjectId = entity.userIdentifiedObject.mrid || ""

    // PersonOrganisation
    dto.personOrganisationId = entity.personOrganisation.mrid || ""

    // OrganisationLocation
    dto.organisationLocationId = entity.organisationLocation.mrid || ""
    dto.organisationId = entity.organisationLocation.organisation_id || ""

    // OrganisationPerson
    dto.organisationPersonId = entity.organisationPerson.mrid || ""

    // OrganisationPsr
    dto.organisationPsrId = entity.organisationPsr.mrid || ""

    return dto
}