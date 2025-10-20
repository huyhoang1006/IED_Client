/* eslint-disable */
// Mapper for Organisation Entity <-> DTO conversion

// Convert Entity (from Database) to DTO (for Vue)
export const OrgEntityToOrgDto = (entity) => {
    if (!entity) return null
    
    const dto = {
        organisationId: entity.id || entity.mrid || '',
        name: entity.name || '',
        tax_code: entity.ref_id || '',
        street: entity.address || '',
        ward_or_commune: entity.position || '',
        district_or_town: entity.department || '',
        city: entity.city || '',
        state_or_province: entity.state || '',
        country: entity.country || '',
        phoneNumber: entity.phone_no || entity.phone1 || '',
        fax: entity.fax || entity.fax_contact || '',
        email: entity.email || entity.email_contact || '',
        comment: entity.comment || '',
        parentId: entity.parent_id || '',
        mode: entity.mode || 'organisation',
        x_position: '',
        y_position: '',
        z_position: '',
        positionPoints: {
            x: [],
            y: [],
            z: []
        },
        electronicAddressId: entity.electronicAddressId || '',
        telephoneNumberId: entity.telephoneNumberId || '',
        streetDetailId: entity.streetDetailId || '',
        townDetailId: entity.townDetailId || '',
        streetAddressId: entity.streetAddressId || '',
        attachmentId: entity.attachmentId || '',
        attachment: {
            id: entity.attachmentId || '',
            name: entity.attachmentName || null,
            path: entity.attachmentPath || '',
            type: 'organisation',
            id_foreign: entity.id || entity.mrid || ''
        },
        configurationEvent: entity.configurationEvent || [],
        user_id: entity.user_id || '',
        user_name: entity.name_person || entity.user_name || ''
    }
    
    return dto
}

// Convert DTO (from Vue) to Entity (for Database)
export const OrgDtoToOrgEntity = (dto) => {
    if (!dto) return null
    
    const entity = {
        id: dto.organisationId || dto.id || '',
        mrid: dto.organisationId || dto.id || '',
        name: dto.name || '',
        ref_id: dto.tax_code || '',
        address: dto.street || '',
        city: dto.city || '',
        state: dto.state_or_province || '',
        country: dto.country || '',
        phone_no: dto.phoneNumber || '',
        phone1: dto.phoneNumber || '',
        phone2: '',
        fax: dto.fax || '',
        fax_contact: dto.fax || '',
        email: dto.email || '',
        email_contact: dto.email || '',
        comment: dto.comment || '',
        parent_id: dto.parentId || null,
        mode: dto.mode || 'organisation',
        user_id: dto.user_id || null,
        name_person: dto.user_name || null,
        department: dto.district_or_town || '',
        position: dto.ward_or_commune || '',
        electronicAddressId: dto.electronicAddressId || null,
        telephoneNumberId: dto.telephoneNumberId || null,
        streetDetailId: dto.streetDetailId || null,
        townDetailId: dto.townDetailId || null,
        streetAddressId: dto.streetAddressId || null,
        attachmentId: dto.attachmentId || null,
        attachmentName: dto.attachment?.name || null,
        attachmentPath: dto.attachment?.path || null,
        configurationEvent: dto.configurationEvent || []
    }
    
    return entity
}

