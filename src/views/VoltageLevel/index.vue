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
                            <el-row :gutter="8" class="voltage-input-row">
                                <el-col :span="8">
                                    <el-select v-model.number="properties.high_voltage_limit_value" allow-create filterable placeholder="Value" size="small">
                                        <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col :span="8">
                                    <el-select v-model="properties.high_voltage_limit_multiplier" placeholder="k" size="small">
                                        <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit.label" :value="unit.value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col :span="8">
                                    <el-select v-model="properties.high_voltage_limit_unit" placeholder="V" size="small">
                                        <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>    
                                </el-col>
                            </el-row>
                        </el-form-item>
                        <el-form-item label="Low voltage limit" class="custom-label">
                            <el-row :gutter="8" class="voltage-input-row">
                                <el-col :span="8">
                                    <el-select v-model.number="properties.low_voltage_limit_value" allow-create filterable placeholder="Value" size="small">
                                        <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col :span="8">
                                    <el-select v-model="properties.low_voltage_limit_multiplier" placeholder="k" size="small">
                                        <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit.label" :value="unit.value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col :span="8">
                                    <el-select v-model="properties.low_voltage_limit_unit" placeholder="V" size="small">
                                        <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                            </el-row>
                        </el-form-item>
                        <el-form-item label="Base voltage" class="custom-label">
                            <el-row :gutter="8" class="voltage-input-row">
                                <el-col :span="8">
                                    <el-select @change="handleBaseVoltageChange" v-model.number="properties.base_voltage_value" allow-create filterable placeholder="Value" size="small">
                                        <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col :span="8">
                                    <el-select v-model="properties.base_voltage_multiplier" placeholder="k" size="small">
                                        <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit.label" :value="unit.value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col :span="8">
                                    <el-select v-model="properties.base_voltage_unit" placeholder="V" size="small">
                                        <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                            </el-row>
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
:deep(.el-form-item__label) {
    font-size: 12px !important;
}

.bolder {
    font-weight: bold;
    font-size: 12px;
}

.voltage-input-row {
    width: 100%;
}

.voltage-input-row :deep(.el-col) {
    padding-left: 4px !important;
    padding-right: 4px !important;
}

.voltage-input-row :deep(.el-select) {
    width: 100%;
}

.voltage-input-row :deep(.el-select .el-input__inner) {
    padding: 0 30px 0 8px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
}
</style>