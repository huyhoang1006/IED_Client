/* eslint-disable */
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier"
import { UnitSymbol } from "@/views/Enum/UnitSymbol"
import VoltageLevelDto from "@/views/Dto/VoltageLevel/index.js"
import * as voltageMapper from "@/views/Mapping/VoltageLevel/index.js"
import uuid from "@/utils/uuid"

export default {
    data() {
        const properties = new VoltageLevelDto()
        // Set default values: multiplier = 'k' (K), unit = 'V'
        properties.high_voltage_limit_multiplier = UnitMultiplier.K
        properties.high_voltage_limit_unit = UnitSymbol.V
        properties.low_voltage_limit_multiplier = UnitMultiplier.K
        properties.low_voltage_limit_unit = UnitSymbol.V
        properties.base_voltage_multiplier = UnitMultiplier.K
        properties.base_voltage_unit = UnitSymbol.V
        
        return {
            properties: properties,
            labelWidth: `150px`,
            voltageList : ['500', '220', '110', '35', '26', '22', '21', '15.75', '13.8', '10', '6.6', '0.4'],
            voltageUnitArr : [UnitSymbol.V],
            voltageMultiplierArr : [
                { label: 'k', value: UnitMultiplier.K },
                { label: 'm', value: UnitMultiplier.M }
            ]
        }
    },
    methods: {
        async saveCtrS() {
            const data = await this.saveVoltageLevel()
            if(data.success) {
                this.$message.success("Voltage Level saved successfully")
            } else {
                this.$message.error("Failed to save Voltage Level")
            }
        },

        resetForm() {
            this.properties = new VoltageLevelDto()
            // Set default values: multiplier = 'k' (K), unit = 'V'
            this.properties.high_voltage_limit_multiplier = UnitMultiplier.K
            this.properties.high_voltage_limit_unit = UnitSymbol.V
            this.properties.low_voltage_limit_multiplier = UnitMultiplier.K
            this.properties.low_voltage_limit_unit = UnitSymbol.V
            this.properties.base_voltage_multiplier = UnitMultiplier.K
            this.properties.base_voltage_unit = UnitSymbol.V
        },

        // Helper function to convert multiplier value to enum
        convertMultiplierToEnum(multiplier) {
            if (multiplier === null || multiplier === undefined) return null
            // Convert to number if it's a string
            const numValue = typeof multiplier === 'string' ? Number(multiplier) : multiplier
            // Check if it matches enum values
            if (numValue === UnitMultiplier.K || numValue === 3) return UnitMultiplier.K
            if (numValue === UnitMultiplier.M || numValue === -3) return UnitMultiplier.M
            if (numValue === UnitMultiplier.MEGA || numValue === 6) return UnitMultiplier.MEGA
            if (numValue === UnitMultiplier.G || numValue === 9) return UnitMultiplier.G
            if (numValue === UnitMultiplier.T || numValue === 12) return UnitMultiplier.T
            if (numValue === UnitMultiplier.MICRO || numValue === -6) return UnitMultiplier.MICRO
            if (numValue === UnitMultiplier.N || numValue === -9) return UnitMultiplier.N
            if (numValue === UnitMultiplier.P || numValue === -12) return UnitMultiplier.P
            if (numValue === UnitMultiplier.NONE || numValue === 0) return UnitMultiplier.NONE
            // Return as is if no match
            return numValue
        },

        loadData(data) {
            this.properties = data
            // Convert multiplier values from database (3, -3) to enum values for dropdown match
            if (this.properties.high_voltage_limit_multiplier !== null && this.properties.high_voltage_limit_multiplier !== undefined) {
                this.properties.high_voltage_limit_multiplier = this.convertMultiplierToEnum(this.properties.high_voltage_limit_multiplier)
            } else {
                this.properties.high_voltage_limit_multiplier = UnitMultiplier.K
            }
            if (this.properties.high_voltage_limit_unit === null || this.properties.high_voltage_limit_unit === undefined) {
                this.properties.high_voltage_limit_unit = UnitSymbol.V
            }
            if (this.properties.low_voltage_limit_multiplier !== null && this.properties.low_voltage_limit_multiplier !== undefined) {
                this.properties.low_voltage_limit_multiplier = this.convertMultiplierToEnum(this.properties.low_voltage_limit_multiplier)
            } else {
                this.properties.low_voltage_limit_multiplier = UnitMultiplier.K
            }
            if (this.properties.low_voltage_limit_unit === null || this.properties.low_voltage_limit_unit === undefined) {
                this.properties.low_voltage_limit_unit = UnitSymbol.V
            }
            if (this.properties.base_voltage_multiplier !== null && this.properties.base_voltage_multiplier !== undefined) {
                this.properties.base_voltage_multiplier = this.convertMultiplierToEnum(this.properties.base_voltage_multiplier)
            } else {
                this.properties.base_voltage_multiplier = UnitMultiplier.K
            }
            if (this.properties.base_voltage_unit === null || this.properties.base_voltage_unit === undefined) {
                this.properties.base_voltage_unit = UnitSymbol.V
            }
        },

        loadMapForView () {
        },

        async saveVoltageLevel() {
            try {
                // Validate if values are provided
                if (this.properties.low_voltage_limit_value !== null && this.properties.low_voltage_limit_value !== undefined && isNaN(this.properties.low_voltage_limit_value)) {
                    this.$message.error("Low voltage limit must be numeric.");
                    return { success: false }
                }
                if (this.properties.high_voltage_limit_value !== null && this.properties.high_voltage_limit_value !== undefined && isNaN(this.properties.high_voltage_limit_value)) {
                    this.$message.error("High voltage limit must be numeric.");
                    return { success: false }
                }
                if (this.properties.base_voltage_value !== null && this.properties.base_voltage_value !== undefined && isNaN(this.properties.base_voltage_value)) {
                    this.$message.error("Base voltage must be numeric.");
                    return { success: false }
                }
                
                // Proceed with save
                let data = JSON.parse(JSON.stringify(this.properties));
                const result = this.checkVoltageLevel(data);
                const resultEntity = voltageMapper.mapDtoToEntity(result);
                const resultData = await window.electronAPI.insertVoltageLevelEntity(resultEntity)
                if(resultData.success) {
                    return {
                        success: true,
                        data: resultData.data
                    }
                } else {
                    const errorMsg = resultData.message || "Failed to save voltage level."
                    this.$message.error(errorMsg);
                    return {
                        success: false,
                        error: resultData.error,
                        message: errorMsg
                    }
                }
            } catch (error) {
                this.$message.error("An error occurred while saving the voltage level: " + error.message);
                return { success: false, error: error.message }
            }
        },

        checkBaseVoltage(data) {
            if(data.baseVoltageId === null || data.baseVoltageId === '') {
                if(data.base_voltage_value !== null && data.base_voltage_value !== undefined) {
                    data.baseVoltageId = uuid.newUuid();
                }
            }
        },

        checkNominalVoltage(data) {
            if(data.nominalVoltageId === null || data.nominalVoltageId === '') {
                if(data.base_voltage_value !== null && data.base_voltage_value !== undefined) {
                    data.nominalVoltageId = uuid.newUuid();
                }
            }
        },

        checkVoltageLevel(data) {
            if(data.voltageLevelId === null || data.voltageLevelId === '') {
                data.voltageLevelId = uuid.newUuid();
            }
            // Ensure name is set (required by identifiedObject)
            if(!data.name || data.name === '') {
                // Use base voltage value to generate name if available
                if(data.base_voltage_value !== null && data.base_voltage_value !== undefined) {
                    const multiplier = data.base_voltage_multiplier === UnitMultiplier.M ? 'm' : 'k'
                    const unit = data.base_voltage_unit || UnitSymbol.V
                    data.name = `${data.base_voltage_value} ${multiplier}${unit}`
                } else {
                    data.name = data.voltageLevelId
                }
            }
            const parentMrid = this.parent && this.parent.mrid ? this.parent.mrid : null
            if(!data.substationId || data.substationId === '') {
                data.substationId = parentMrid
            }
            if(!data.substation || data.substation === '') {
                data.substation = data.substationId || parentMrid
            }
            if(data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId ? this.locationId : null
            }
            
            this.checkBaseVoltage(data);
            this.checkNominalVoltage(data);
            this.checkHighVoltageLimit(data);
            this.checkLowVoltageLimit(data);
            return data;
        },

        checkHighVoltageLimit(data) {
            if(data.highVoltageLimitId === null || data.highVoltageLimitId === '') {
                if(data.high_voltage_limit_value !== null && data.high_voltage_limit_value !== undefined) {
                    data.highVoltageLimitId = uuid.newUuid();
                }
            }
        },

        checkLowVoltageLimit(data) {
            if(data.lowVoltageLimitId === null || data.lowVoltageLimitId === '') {
                if(data.low_voltage_limit_value !== null && data.low_voltage_limit_value !== undefined) {
                    data.lowVoltageLimitId = uuid.newUuid();
                }
            }
        },

        handleBaseVoltageChange(value) {
            if(this.properties.name == '') {
                this.properties.name = `${value} ${this.properties.base_voltage_multiplier}${this.properties.base_voltage_unit}`
            }
        }
    },
}