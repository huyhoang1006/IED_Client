import StreetAddress from "../../Cim/StreetAddress/index.js"
import StreetDetail from "../../Cim/StreetDetail/index.js"
import Substation from "../../Cim/Substation/index.js"
import TownDetail from "../../Cim/TownDetail/index.js"
import Location from "../../Cim/Location/index.js"
import EletronicAddress from "../../Cim/ElectronicAddress/index.js"
import TelephoneNumber from "../../Cim/TelephoneNumber/index.js"
import Person from "../../Cim/Person/index.js"
import PersonRole from "../../Cim/PersonRole/index.js"
import User from "../../Entity/User/index.js"
import PersonSubstation from "../../Entity/PersonSubstation/index.js" 
import Attachment from "../../Entity/Attachment/index.js"
import UserIdentifiedObject from "../../Entity/UserIdentifiedObject/index.js"
import OrganisationLocation from "../../Entity/OrganisationLocation/index.js"
import PsrType from "../../Cim/PsrType/index.js"
import OrganisationPerson from "../../Entity/OrganisationPerson/index.js"
import OrganisationPsr from "../../Entity/OrganisationPsr/index.js"   

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