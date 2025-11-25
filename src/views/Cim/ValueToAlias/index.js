import IdentifiedObject from "../IdentifiedObject/index.js";

class ValueToAlias extends IdentifiedObject {
    constructor() {
        super();
        this.value = null;
        this.value_alias_set = null; // Alias for the value
    }
}

export default ValueToAlias;