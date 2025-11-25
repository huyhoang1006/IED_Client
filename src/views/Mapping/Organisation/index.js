import OrganisationEntity from '@/views/Entity/Organisation/index.js';
import GeoMap from '@/views/Entity/GeoMap/index.js';
import OrganisationDto from '@/views/Dto/Organisation/index.js';

export const OrgDtoToOrgEntity = (orgDto) => {
    const orgEntity = new OrganisationEntity();
    // Organisation
    // Ensure mrid is not empty string - use null only if truly null/undefined
    orgEntity.organisation.mrid = (orgDto.organisationId && orgDto.organisationId !== '') ? orgDto.organisationId : null;
    // Preserve empty strings - only convert undefined/null to null, not empty strings
    orgEntity.organisation.name = (orgDto.name !== undefined && orgDto.name !== null) ? orgDto.name : null;
    orgEntity.organisation.tax_code = (orgDto.tax_code !== undefined && orgDto.tax_code !== null) ? orgDto.tax_code : null;
    orgEntity.organisation.description = (orgDto.comment !== undefined && orgDto.comment !== null) ? orgDto.comment : null;
    orgEntity.organisation.street_address = orgDto.streetAddressId || null;
    orgEntity.organisation.electronic_address = orgDto.electronicAddressId || null;
    orgEntity.organisation.phone = orgDto.telephoneNumberId || null;
    orgEntity.organisation.parent_organisation = orgDto.parentId || null

    //address address
    orgEntity.streetAddress.mrid = orgDto.streetAddressId || null;
    orgEntity.streetAddress.town_detail = orgDto.townDetailId || null;
    orgEntity.streetAddress.street_detail = orgDto.streetDetailId || null;

    //Street detail
    orgEntity.streetDetail.mrid = (orgDto.streetDetailId && orgDto.streetDetailId !== '') ? orgDto.streetDetailId : null;
    orgEntity.streetDetail.address_general = orgDto.street || null;

    //Town detail
    orgEntity.townDetail.mrid = (orgDto.townDetailId && orgDto.townDetailId !== '') ? orgDto.townDetailId : null;
    orgEntity.townDetail.ward_or_commune = orgDto.ward_or_commune || null;
    orgEntity.townDetail.district_or_town = orgDto.district_or_town || null;
    orgEntity.townDetail.state_or_province = orgDto.state_or_province || null;
    orgEntity.townDetail.country = orgDto.country || null;
    orgEntity.townDetail.city = orgDto.city || null;

    //Electronic address
    orgEntity.electronicAddress.mrid = (orgDto.electronicAddressId && orgDto.electronicAddressId !== '') ? orgDto.electronicAddressId : null;
    orgEntity.electronicAddress.email = orgDto.email || null;
    orgEntity.electronicAddress.fax = orgDto.fax || null;

    //Telephone number
    orgEntity.telephoneNumber.mrid = orgDto.telephoneNumberId || null;
    orgEntity.telephoneNumber.itu_phone = orgDto.phoneNumber || null;

    //Person
    orgEntity.person.mrid = orgDto.personId || null;
    orgEntity.person.name = orgDto.personName || null;
    orgEntity.person.electronic_address = orgDto.electronicAddressId || null;
    orgEntity.person.mobile_phone = orgDto.telephoneNumberId || null;

    //PersonRole
    orgEntity.personRole.mrid = orgDto.personRoleId || null;
    orgEntity.personRole.department = orgDto.department || null;
    orgEntity.personRole.position = orgDto.position || null;
    orgEntity.personRole.person = orgDto.personId || null;
    orgEntity.personRole.organisation = orgDto.organisationId || null;

    //Attachment
    if (orgDto.attachment) {
        orgEntity.attachment = orgDto.attachment;
        // Ensure mrid is set if attachmentId exists
        if (orgDto.attachmentId && orgDto.attachmentId !== '') {
            orgEntity.attachment.mrid = orgDto.attachmentId;
        }
    } else {
        orgEntity.attachment.mrid = orgDto.attachmentId || null;
    }

    //configurationEvent
    if (Array.isArray(orgDto.configurationEvent) && orgDto.configurationEvent.length > 0) {
        orgEntity.configurationEvent = orgDto.configurationEvent
    }

    if(Array.isArray(orgDto.positionPoints.x) && orgDto.positionPoints.x.length > 0) {
        for (let i = 0; i < orgDto.positionPoints.x.length; i++) {
            const geoMapPoint = new GeoMap();
            geoMapPoint.mrid = orgDto.positionPoints.x[i].id || null;
            geoMapPoint.x = orgDto.positionPoints.x[i].coor || null;
            geoMapPoint.y = orgDto.positionPoints.y[i].coor || null;
            geoMapPoint.z = orgDto.positionPoints.z[i].coor || null;
            geoMapPoint.organisation_id = orgDto.organisationId || null;
            orgEntity.positionPoints.push(geoMapPoint);
        }
    }

    return orgEntity;
};

export const OrgEntityToOrgDto = (orgEntity) => {
    const orgDto = new OrganisationDto();

    // Organisation
    orgDto.organisationId = orgEntity.organisation.mrid || ''
    orgDto.name = orgEntity.organisation.name || ''
    orgDto.tax_code = orgEntity.organisation.tax_code || ''
    orgDto.comment = orgEntity.organisation.description || ''
    orgDto.streetAddressId = orgEntity.organisation.street_address || ''
    orgDto.electronicAddressId = orgEntity.organisation.electronic_address || ''
    orgDto.telephoneNumberId = orgEntity.organisation.phone || ''
    orgDto.parentId = orgEntity.organisation.parent_organisation || '';
    
    // Street Address
    orgDto.streetAddressId = (orgEntity.streetAddress && orgEntity.streetAddress.mrid) ? orgEntity.streetAddress.mrid : '';
        
    // Street Detail
    if (orgEntity.streetDetail && orgEntity.streetDetail.mrid) {
        orgDto.streetDetailId = orgEntity.streetDetail.mrid || '';
        orgDto.street = orgEntity.streetDetail.address_general || '';
    } else {
        orgDto.streetDetailId = '';
        orgDto.street = '';
    }

    // Town Detail
    if (orgEntity.townDetail && orgEntity.townDetail.mrid) {
        orgDto.townDetailId = orgEntity.townDetail.mrid || '';
        orgDto.ward_or_commune = orgEntity.townDetail.ward_or_commune || '';
        orgDto.district_or_town = orgEntity.townDetail.district_or_town || '';
        orgDto.state_or_province = orgEntity.townDetail.state_or_province || '';
        orgDto.country = orgEntity.townDetail.country || '';
        orgDto.city = orgEntity.townDetail.city || '';
    } else {
        orgDto.townDetailId = '';
        orgDto.ward_or_commune = '';
        orgDto.district_or_town = '';
        orgDto.state_or_province = '';
        orgDto.country = '';
        orgDto.city = '';
    }

    // Electronic Address
    orgDto.electronicAddressId = orgEntity.electronicAddress.mrid || '';
    orgDto.email = orgEntity.electronicAddress.email || '';
    orgDto.fax = orgEntity.electronicAddress.fax || '';

    // Telephone Number
    orgDto.telephoneNumberId = orgEntity.telephoneNumber.mrid || '';
    orgDto.phoneNumber = orgEntity.telephoneNumber.itu_phone || '';

    // Person
    if (orgEntity.person) {
        orgDto.personId = orgEntity.person.mrid || '';
        orgDto.personName = orgEntity.person.name || '';
    }

    // PersonRole - Map department and position
    if (orgEntity.personRole) {
        orgDto.personRoleId = orgEntity.personRole.mrid || '';
        // Convert null/undefined to empty string to avoid displaying "null" in UI
        orgDto.department = (orgEntity.personRole.department !== null && orgEntity.personRole.department !== undefined) 
            ? String(orgEntity.personRole.department) 
            : '';
        orgDto.position = (orgEntity.personRole.position !== null && orgEntity.personRole.position !== undefined) 
            ? String(orgEntity.personRole.position) 
            : '';
    } else {
        // If personRole doesn't exist, ensure department and position are empty strings
        orgDto.personRoleId = '';
        orgDto.department = '';
        orgDto.position = '';
    }

    // Attachment
    orgDto.attachmentId = orgEntity.attachment.mrid || '';
    orgDto.attachment = orgEntity.attachment;

    // Configuration Events
    if (orgEntity.configurationEvent && Array.isArray(orgEntity.configurationEvent)) {
        orgDto.configurationEvent = orgEntity.configurationEvent;
    }

    // Position Points
    orgDto.positionPoints = { x: [], y: [], z: [] };
    if (orgEntity.positionPoints && Array.isArray(orgEntity.positionPoints)) {
        for (let i = 0; i < orgEntity.positionPoints.length; i++) {
            const pt = orgEntity.positionPoints[i];
            if (pt) {
                orgDto.positionPoints.x.push({ id: pt.mrid, coor: pt.x });
                orgDto.positionPoints.y.push({ id: pt.mrid, coor: pt.y });
                orgDto.positionPoints.z.push({ id: pt.mrid, coor: pt.z });
            }
        }
    }

    return orgDto;
};

// Alias for consistency with other mappers
export const mapEntityToDto = OrgEntityToOrgDto;
export const mapDtoToEntity = OrgDtoToOrgEntity;
