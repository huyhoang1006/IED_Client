import IdentifiedObject from "../IdentifiedObject/index.js";

class BaseVoltage extends IdentifiedObject {
    constructor() {
        super();
        this.nominal_voltage = null;
    }
}

export default BaseVoltage;
