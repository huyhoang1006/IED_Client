import Attachment from "@/views/Entity/Attachment/index.js"

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
        this.x_position = ''
        this.y_position = ''
        this.z_position = ''
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
    }
}

export default SubstationDto