import VoltageLevel from '../../Cim/VoltageLevel/index.js';
import BaseVoltage from '../../Cim/BaseVoltage/index.js';
class VoltageLevelEntity {
    constructor() {
        this.voltageLevel = new VoltageLevel();
        this.baseVoltage = new BaseVoltage();
        this.voltage = [];
    }
}

export default VoltageLevelEntity;
