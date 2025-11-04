class OrganisationDto {
    constructor() {
        // Organisation basic fields
        this.organisationId = ''
        this.name = ''
        this.comment = ''
        
        // Organisation specific fields
        this.tax_code = ''
        this.street = ''
        this.city = ''
        this.state_or_province = ''
        this.country = ''
        this.phoneNumber = ''
        this.fax = ''
        this.email = ''
        this.mode = 'organisation'
        this.district_or_town = ''
        this.ward_or_commune = ''
        
        // PSR Type
        this.psrTypeId = ''
        this.type = ''
        this.psrTypeDescription = ''
        this.psrTypeType = ''
        this.category = ''
        this.subCategory = ''
        
        // Address fields
        this.streetAddressId = ''
        this.townDetailId = ''
        this.streetDetailId = ''
        
        // Location
        this.locationId = ''
        this.locationName = ''
        this.locationDescription = ''
        this.latitude = null
        this.longitude = null
        this.elevation = null
        this.coordinateSystem = null
        this.orientation = null
        
        // ElectronicAddress
        this.electronicAddressId = ''
        this.electronicAddressName = ''
        this.electronicAddressDescription = ''
        this.website = ''
        this.electronicPhone = ''
        
        // TelephoneNumber
        this.telephoneNumberId = ''
        this.telephoneName = ''
        this.telephoneDescription = ''
        this.phoneType = ''
        this.countryCode = ''
        this.areaCode = ''
        
        // Person
        this.personId = ''
        this.personName = ''
        this.personDescription = ''
        this.firstName = ''
        this.lastName = ''
        this.middleName = ''
        this.title = ''
        this.gender = ''
        this.birthDate = null
        this.nationality = ''
        
        // PersonRole
        this.personRoleId = ''
        this.department = ''
        this.position = ''
        this.roleName = ''
        this.roleDescription = ''
        this.role = ''
        this.startDate = null
        this.endDate = null
        
        // Attachment
        this.attachmentId = ''
        this.attachment = ''
        
        // PositionPoints
        this.positionPoints = {
            x: [],
            y: [],
            z: []
        }
        
        // User
        this.userId = ''
        this.userName = ''
        
        // UserIdentifiedObject
        this.userIdentifiedObjectId = ''
        
        // PersonOrganisation
        this.personOrganisationId = ''
        
        // OrganisationLocation
        this.organisationLocationId = ''
        
        // OrganisationPerson
        this.organisationPersonId = ''
        
        // OrganisationPsr
        this.organisationPsrId = ''
        
        // ConfigurationEvent
        this.configurationEvent = []
    }
}

export default OrganisationDto