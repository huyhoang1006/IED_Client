/* eslint-disable */
// DTO for Organisation/Owner entity
export default class OrganisationDto {
    constructor() {
        this.organisationId = ''
        this.name = ''
        this.tax_code = ''
        this.street = ''
        this.ward_or_commune = ''
        this.district_or_town = ''
        this.city = ''
        this.state_or_province = ''
        this.country = ''
        this.phoneNumber = ''
        this.fax = ''
        this.email = ''
        this.comment = ''
        this.parentId = ''
        this.mode = 'organisation'
        this.x_position = ''
        this.y_position = ''
        this.z_position = ''
        this.positionPoints = {
            x: [],
            y: [],
            z: []
        }
        this.electronicAddressId = ''
        this.telephoneNumberId = ''
        this.streetDetailId = ''
        this.townDetailId = ''
        this.streetAddressId = ''
        this.attachmentId = ''
        this.attachment = {
            id: '',
            name: null,
            path: '',
            type: 'organisation',
            id_foreign: ''
        }
        this.configurationEvent = []
        this.user_id = ''
        this.user_name = ''
    }
}

