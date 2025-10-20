import StreetAddress from "@/views/Cim/StreetAddress/index.js"
import StreetDetail from "@/views/Cim/StreetDetail/index.js"
import Substation from "@/views/Cim/Substation/index.js"
import TownDetail from "@/views/Cim/TownDetail/index.js"
import Location from "@/views/Cim/Location/index.js"
import EletronicAddress from "@/views/Cim/ElectronicAddress/index.js"
import TelephoneNumber from "@/views/Cim/TelephoneNumber/index.js"
import Person from "@/views/Cim/Person/index.js"
import PersonRole from "@/views/Cim/PersonRole/index.js"
import User from "../User"
import PersonSubstation from "../PersonSubstation"
import Attachment from "../Attachment/index.js"
import UserIdentifiedObject from "../UserIdentifiedObject/index.js"
import OrganisationLocation from "../OrganisationLocation/index.js"
import PsrType from "@/views/Cim/PsrType/index.js"
import OrganisationPerson from "../OrganisationPerson/index.js"
import OrganisationPsr from "../OrganisationPsr/index.js"

class SubstationEntity {
    constructor() {
        this.substation = new Substation
        this.streetDetail = new StreetDetail
        this.townDetail = new TownDetail
        this.streetAddress = new StreetAddress
        this.location = new Location
        this.electronicAddress = new EletronicAddress
        this.telephoneNumber = new TelephoneNumber
        this.person = new Person
        this.personRole = new PersonRole
        this.user = new User
        this.userIdentifiedObject = new UserIdentifiedObject
        this.personSubstation = new PersonSubstation
        this.attachment = new Attachment
        this.positionPoint = []
        this.userIdentifiedObject = new UserIdentifiedObject
        this.organisationLocation = new OrganisationLocation
        this.userIdentifiedObject = new UserIdentifiedObject
        this.personSubstation = new PersonSubstation
        this.organisationLocation = new OrganisationLocation
        this.organisationPerson = new OrganisationPerson
        this.psrType = new PsrType
        this.organisationPsr = new OrganisationPsr
        this.configurationEvent = []
    }
}
export default SubstationEntity