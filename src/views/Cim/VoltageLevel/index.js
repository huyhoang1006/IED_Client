import EquipmentContainer from "../EquipmentContainer/index.js"

class VoltageLevel extends EquipmentContainer {
    constructor() {
        super();
        this.high_voltage_limit = null  
        this.low_voltage_limit = null   
        this.base_voltage = null    
        this.substation = null  
    }
}

export default VoltageLevel;