import Attachment from "@/views/Entity/Attachment/index.js"
class OrganisationDto {
    constructor() {
            this.name = ''
            this.street = ''
            this.ward_or_commune = ''
            this.district_or_town = ''
            this.city = ''
            this.state_or_province = ''
            this.tax_code = ''
            this.country = ''
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
            this.telephoneNumberId = ''
            this.attachmentId = ''
            this.streetDetailId = ''
            this.streetAddressId = ''
            this.userId = ''
            this.userName = ''
            this.organisationId = ''
            this.electronicAddressId = ''
            this.townDetailId = ''
            this.configurationEvent = []
            this.parentId = ''
            // Person fields
            this.personName = ''
            this.personId = ''
            this.personRoleId = ''
            this.department = ''
            this.position = ''
            this.phoneNumber = ''
            this.email = ''
            this.fax = ''
    }
}

export default OrganisationDto