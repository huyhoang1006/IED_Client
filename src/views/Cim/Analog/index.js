import Measurement from "@/views/Cim/Measurement/index.js";
class Analog extends Measurement {
    constructor() {
        super();
        this.max_value = null;
        this.min_value = null;
        this.normal_value = null;
        this.positive_flow_in = null;
    }
}

export default Analog;
