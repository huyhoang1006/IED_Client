<template>
    <div>
         <el-row :gutter="20">
            <el-col :span="12">
                <div class="col-content">
                    <el-form :model="properties" :inline-message="true" :label-width="labelWidth" size="small" label-position="left">
                        <span class="bolder">Properties</span>
                        <el-divider class="thick-divider"></el-divider>
                        <el-form-item label="Voltage Level">
                        </el-form-item>
                        <el-form-item label="Name" class="custom-label">
                            <el-input v-model="properties.name"></el-input>
                        </el-form-item>
                        <el-form-item label="High voltage limit" class="custom-label">
                            <div class="voltage-input-group">
                                <el-select v-model.number="properties.high_voltage_limit_value" allow-create filterable placeholder="Value" class="voltage-value-select">
                                    <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                </el-select>
                                <el-select v-model="properties.high_voltage_limit_multiplier" placeholder="Unit" class="voltage-unit-select">
                                    <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit.label" :value="unit.value"></el-option>
                                </el-select>
                                <el-select v-model="properties.high_voltage_limit_unit" placeholder="Symbol" class="voltage-unit-select">
                                    <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                        <el-form-item label="Low voltage limit" class="custom-label">
                            <div class="voltage-input-group">
                                <el-select v-model.number="properties.low_voltage_limit_value" allow-create filterable placeholder="Value" class="voltage-value-select">
                                    <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                </el-select>
                                <el-select v-model="properties.low_voltage_limit_multiplier" placeholder="Unit" class="voltage-unit-select">
                                    <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit.label" :value="unit.value"></el-option>
                                </el-select>
                                <el-select v-model="properties.low_voltage_limit_unit" placeholder="Symbol" class="voltage-unit-select">
                                    <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                        <el-form-item label="Base voltage" class="custom-label">
                            <div class="voltage-input-group">
                                <el-select @change="handleBaseVoltageChange" v-model.number="properties.base_voltage_value" allow-create filterable placeholder="Value" class="voltage-value-select">
                                    <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                </el-select>
                                <el-select v-model="properties.base_voltage_multiplier" placeholder="Unit" class="voltage-unit-select">
                                    <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit.label" :value="unit.value"></el-option>
                                </el-select>
                                <el-select v-model="properties.base_voltage_unit" placeholder="Unit" class="voltage-unit-select">
                                    <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="col-content">
                    <el-form :label-width="labelWidth" size="small" label-position="left">
                        <span class="bolder">Comment </span>
                        <el-divider></el-divider>
                        <el-input type="textarea" :rows="5" v-model="properties.comment"></el-input>
                    </el-form>
                </div>
            </el-col>        
        </el-row>
    </div>
</template>

<script>
import mixin from '../VoltageLevel/mixin/index.js'
export default {
    name: 'VoltageLevel',
    mixins: [mixin],
    props: {
        parent: {
            type: Object,
            default: () => ({})
        },
        locationId: {
            type: String,
            default: ''
        }
    },
}
</script>

<style scoped>
::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

.bolder {
    font-weight: bold;
    font-size: 12px;
}

.voltage-input-group {
    display: flex;
    gap: 8px;
    width: 100%;
    align-items: center;
}

.voltage-value-select {
    flex: 1.4;
    min-width: 0;
}

.voltage-unit-select {
    flex: 0.5;
    min-width: 0;
}

/* Đảm bảo tổng độ rộng bằng với input Name */
::v-deep(.el-form-item__content) {
    width: 100%;
}

::v-deep(.el-input) {
    width: 100%;
}
</style>