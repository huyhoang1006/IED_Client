import TelephoneNumber from '../../Cim/TelephoneNumber/index.js';
import StreetAddress from '../../Cim/StreetAddress/index.js';
import TownDetail from '../../Cim/TownDetail/index.js';
import StreetDetail from '../../Cim/StreetDetail/index.js';    
import Attachment from '../Attachment/index.js';
import EletronicAddress from '../../Cim/ElectronicAddress/index.js';
import Organisation from '../../Cim/Organisation/index.js';
import User from '../User/index.js'
import Person from '../../Cim/Person/index.js'
import PersonRole from '../../Cim/PersonRole/index.js'

class OrganisationEntity {
    constructor() {
        this.organisation = new Organisation();
        this.electronicAddress = new EletronicAddress();
        this.telephoneNumber = new TelephoneNumber();
        this.streetAddress = new StreetAddress();
        this.townDetail = new TownDetail();
        this.streetDetail = new StreetDetail();
        this.attachment = new Attachment();
        this.configurationEvent = [];
        this.positionPoints = [];           // Cho bảng geo_map
        this.positionPointsLocation = [];   // Cho bảng position_point
        this.user = new User();
        this.person = new Person();
        this.personRole = new PersonRole();
    }
}

export default OrganisationEntity