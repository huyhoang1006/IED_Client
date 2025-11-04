import Attachment from "@/views/Entity/Attachment"

class SubstationDto {
    constructor() {
        this.name = ''
        this.type = ''
        this.generation = ''
        this.industry = ''
        this.locationName = ''
        this.street = ''
        this.ward_or_commune = ''
        this.district_or_town = ''
        this.city = ''
        this.state_or_province = ''
        this.country = ''
        this.personName = ''
        this.department = ''
        this.position = ''
        this.phoneNumber = ''
        this.email = ''
        this.fax = ''
        this.comment = ''
        this.positionPoints = {
            x: [],
            y: [],
            z: []
        }
        this.attachment = new Attachment()
        this.subsId = ''
        this.locationId = ''
        this.personId = ''
        this.telephoneNumberId = ''
        this.attachmentId = ''
        this.streetDetailId = ''
        this.streetAddressId = ''
        this.userId = ''
        this.userName = ''
        this.personId = ''
        this.personRoleId = ''
        this.userIdentifiedObjectId = ''
        this.personSubstationId = ''
        this.organisationLocationId = ''
        this.organisationPersonId = ''
        this.organisationPsrId = ''
        this.organisationId = ''
        this.psrTypeId = ''
        this.electronicAddressId = ''
        this.townDetailId = ''
        this.configurationEvent = []
        
        // EquipmentContainer/Substation additional fields
        this.aliasName = ''
        this.assetInfo = null
        this.containers = []
        this.equipments = []
        
        // Location additional fields
        this.locationDescription = ''
        this.latitude = null
        this.longitude = null
        this.elevation = null
        this.coordinateSystem = null
        this.orientation = null
        
        // Person additional fields
        this.personDescription = ''
        this.firstName = ''
        this.lastName = ''
        this.middleName = ''
        this.title = ''
        this.gender = ''
        this.birthDate = null
        this.nationality = ''
        
        // ElectronicAddress additional fields
        this.electronicAddressName = ''
        this.electronicAddressDescription = ''
        this.website = ''
        this.electronicPhone = ''
        
        // TelephoneNumber additional fields
        this.telephoneName = ''
        this.telephoneDescription = ''
        this.phoneType = ''
        this.countryCode = ''
        this.areaCode = ''
        
        // PersonRole additional fields
        this.roleName = ''
        this.roleDescription = ''
        this.role = ''
        this.startDate = null
        this.endDate = null
        
        // PsrType additional fields
        this.psrTypeDescription = ''
        this.psrTypeType = ''
        this.category = ''
        this.subCategory = ''
    }
}

export default SubstationDto