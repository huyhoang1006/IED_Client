// import EquipmentContainer from "../Cim/EquipmentContainer/index.js"

class OrganisationEntity {
    constructor() {
        // Organisation specific fields
        this.organisation = {
            mrid: null,
            name: null,
            description: null,
            location: null,
            ref_id: null,
            address: null,
            city: null,
            state: null,
            country: null,
            phone_no: null,
            fax: null,
            email: null,
            mode: 'organisation',
            department: null,
            position: null,
            psr_type_id: null,
            aliasName: null,
            assetInfo: null,
            containers: [],
            equipments: []
        }
        
        // PSR Type
        this.psrType = {
            mrid: null,
            name: null,
            description: null,
            type: null,
            category: null,
            subCategory: null
        }
        
        // TownDetail
        this.townDetail = {
            mrid: null,
            city: null,
            state_or_province: null,
            country: null,
            district_or_town: null,
            ward_or_commune: null
        }
        
        // StreetDetail
        this.streetDetail = {
            mrid: null,
            address_general: null
        }
        
        // StreetAddress
        this.streetAddress = {
            mrid: null,
            street_detail: null,
            town_detail: null
        }
        
        // Location
        this.location = {
            mrid: null,
            name: null,
            description: null,
            latitude: null,
            longitude: null,
            elevation: null,
            coordinateSystem: null,
            orientation: null,
            main_address: null
        }
        
        // ElectronicAddress
        this.electronicAddress = {
            mrid: null,
            name: null,
            description: null,
            email: null,
            fax: null,
            website: null,
            phone: null
        }
        
        // TelephoneNumber
        this.telephoneNumber = {
            mrid: null,
            name: null,
            description: null,
            itu_phone: null,
            phoneType: null,
            countryCode: null,
            areaCode: null
        }
        
        // Person
        this.person = {
            mrid: null,
            name: null,
            description: null,
            firstName: null,
            lastName: null,
            middleName: null,
            title: null,
            gender: null,
            birthDate: null,
            nationality: null,
            electronic_address: null,
            mobile_phone: null,
            roles: null
        }
        
        // PersonRole
        this.personRole = {
            mrid: null,
            name: null,
            description: null,
            role: null,
            department: null,
            position: null,
            person: null,
            organisation: null,
            startDate: null,
            endDate: null
        }
        
        // User
        this.user = {
            user_id: null,
            username: null
        }
        
        // UserIdentifiedObject
        this.userIdentifiedObject = {
            mrid: null,
            identified_object_id: null,
            user_id: null
        }
        
        // PersonOrganisation
        this.personOrganisation = {
            mrid: null,
            organisation_id: null,
            person_id: null
        }
        
        // Attachment
        this.attachment = {
            id: null,
            name: null,
            path: null,
            type: null,
            id_foreign: null
        }
        
        // PositionPoint
        this.positionPoint = []
        
        // OrganisationLocation
        this.organisationLocation = {
            mrid: null,
            organisation_id: null,
            location_id: null
        }
        
        // OrganisationPerson
        this.organisationPerson = {
            mrid: null,
            organisation_id: null,
            person_id: null
        }
        
        // OrganisationPsr
        this.organisationPsr = {
            mrid: null,
            organisation_id: null,
            psr_id: null
        }
        
        // ConfigurationEvent
        this.configurationEvent = []
    }
}

export default OrganisationEntity