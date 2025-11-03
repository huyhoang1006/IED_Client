import { BreakerConfiguration } from "@/views/Enum/BreakerConfiguration"
import {BusBarConfiguration} from "@/views/Enum/BusBarConfiguration"
import Bay from "@/views/Cim/Bay/index.js"
import uuid from "@/utils/uuid"

export default {
    data() {
        return {
            properties: new Bay(),
            labelWidth: `150px`,
            breakerConfigList: Object.values(BreakerConfiguration),
            busBarConfigList: Object.values(BusBarConfiguration),
        }
    },
    methods: {
        resetForm() {
            this.properties = new Bay();
        },

        async saveCtrS() {
            const data = await this.saveBay()
            if(data.success) {
                this.$message.success("Bay saved successfully")
            } else {
                this.$message.error("Failed to save Bay")
            }
        },

        loadData(data) {
            this.properties = data;
        },

        loadMapForView() {
        },

        async saveBay() {
            if(this.properties.name === null || this.properties.name === '') {
                this.$message.error("Bay name cannot be empty");
                return { success: false };
            } else {
                const data = {
                    mrid: this.properties.mrid,
                    name: this.properties.name,
                    comment: this.properties.comment,
                    bay_energy_meas_flag: this.properties.bay_energy_meas_flag,
                    bay_power_meas_flag: this.properties.bay_power_meas_flag,
                    breaker_configuration: this.properties.breaker_configuration,
                    bus_bar_configuration: this.properties.bus_bar_configuration,
                    substation: this.properties.substation,
                    voltage_level: this.properties.voltage_level,
                };
                const dataResult = this.checkBay(data);
                const result = await window.electronAPI.insertBayEntity(dataResult);
                if (result.success) {
                    return result
                } else {
                    console.error("Failed to save bay:", result);
                    return {
                        success: false,
                    }
                }
            }
        },

        checkBay(data) {
            if(data.mrid === null || data.mrid === '') {
                data.mrid = uuid.newUuid();
            }
            if(this.parent && this.parent.mrid) {
                if(this.parent.mode === 'substation') {
                    data.substation = this.parent.mrid;
                } else if(this.parent.mode === 'voltageLevel') {
                    data.voltage_level = this.parent.mrid;
                }
            }
            return data;
        },

    },
}