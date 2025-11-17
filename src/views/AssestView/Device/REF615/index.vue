<template>
  <div class="device-form-container">
    <!-- Bỏ thuộc tính :rules="rules" khỏi el-form nếu bạn không muốn validation nào cả -->
    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="150px" label-position="right"
      class="device-form" status-icon>
      
      <!-- Giữ lại required cho trường này -->
      <el-form-item label="Alias Name" prop="aliasName" required>
        <el-input v-model="form.aliasName" placeholder="Enter alias name" />
      </el-form-item>

      <!-- Giữ lại required cho trường này -->
      <el-form-item label="Name" prop="name" required>
        <el-input v-model="form.name" placeholder="Enter device name" />
      </el-form-item>

      <!-- SỬA LỖI: Bỏ `prop` và `required` để trường này không bắt buộc -->
      <el-form-item label="Description" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="Enter description" />
      </el-form-item>

      <!-- SỬA LỖI: Bỏ `required` để trường này không bắt buộc -->
      <el-form-item label="Vendor" prop="vendor">
        <el-select v-model="form.vendor" placeholder="Select vendor" style="width: 100%" @change="handleVendorChange" clearable>
          <el-option label="Vendor A" value="vendor_a" />
          <el-option label="Vendor B" value="vendor_b" />
        </el-select>
      </el-form-item>

      <!-- SỬA LỖI: Bỏ `required` để trường này không bắt buộc -->
      <el-form-item label="Device Type" prop="deviceType">
        <el-select 
          v-model="form.deviceType" 
          placeholder="Select device type" 
          style="width: 100%" 
          :disabled="!form.vendor"
          @change="handleDeviceTypeChange"
          clearable>
          <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- SỬA LỖI: Bỏ `required` để trường này không bắt buộc -->
      <el-form-item label="Model" prop="model">
        <el-select 
          v-model="form.model" 
          placeholder="Select model" 
          style="width: 100%" 
          :disabled="!form.deviceType"
          @change="handleModelChange"
          clearable>
          <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- SỬA LỖI: Bỏ `required` để trường này không bắt buộc -->
      <el-form-item label="Role" prop="role">
        <el-input v-model="form.role" placeholder="Role (auto-filled)" disabled />
      </el-form-item>

      <el-form-item label="In Service" prop="inService">
        <el-switch v-model="form.inService" />
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const ruleFormRef = ref()

const deviceTypeOptions = ref([])
const modelOptions = ref([])

const form = reactive({
  aliasName: '',
  name: '',
  description: '',
  vendor: '',
  deviceType: '',
  model: '',
  role: '',
  inService: true
})

// =================================================================
// ⭐ SỬA LỖI: CHỈ GIỮ LẠI CÁC QUY TẮC BẮT BUỘC CẦN THIẾT ⭐
// =================================================================
const rules = reactive({
  aliasName: [{ required: true, message: 'Please enter alias name', trigger: 'blur' }],
  name: [{ required: true, message: 'Please enter device name', trigger: 'blur' }],
  // Đã xóa các quy tắc cho: vendor, deviceType, model, role
})

// Dữ liệu giả lập
const mockData = {
  vendor_a: {
    types: [{ label: 'Type A1 (VA)', value: 'type_a1' }, { label: 'Type A2 (VA)', value: 'type_a2' }],
    models: {
      type_a1: [{ label: 'Model X (A1)', value: 'model_x', role: 'Switch' }, { label: 'Model Y (A1)', value: 'model_y', role: 'Router' }],
      type_a2: [{ label: 'Model Z (A2)', value: 'model_z', role: 'Firewall' }]
    }
  },
  vendor_b: {
    types: [{ label: 'Type B1 (VB)', value: 'type_b1' }],
    models: {
      type_b1: [{ label: 'Model P (B1)', value: 'model_p', role: 'Controller' }]
    }
  }
}

const handleVendorChange = (vendorValue) => {
  form.deviceType = ''; form.model = ''; form.role = '';
  deviceTypeOptions.value = []; modelOptions.value = [];
  if (vendorValue) deviceTypeOptions.value = mockData[vendorValue].types;
}

const handleDeviceTypeChange = (typeValue) => {
  form.model = ''; form.role = '';
  modelOptions.value = [];
  if (typeValue) modelOptions.value = mockData[form.vendor].models[typeValue];
}

const handleModelChange = (modelValue) => {
  form.role = '';
  if (modelValue) {
    const selectedModel = modelOptions.value.find(m => m.value === modelValue);
    if (selectedModel) form.role = selectedModel.role;
  }
}

const saveRef615 = async () => {
  if (!ruleFormRef.value) return
  // validate() vẫn sẽ kiểm tra các rules còn lại (aliasName và name)
  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      const plainFormData = { ...form };
      console.log("Submit OK. Dữ liệu form thuần túy:", plainFormData)
    } else {
      console.log('Validation failed for required fields!')
      return false
    }
  })
}

const resetForm = () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value.resetFields()
  deviceTypeOptions.value = []
  modelOptions.value = []
}

defineExpose({
  saveRef615,
  resetForm,
  form,
  ruleFormRef
})
</script>

<style scoped>
.device-form-container {
  padding: 20px;
  max-width: 600px;
  margin: auto;
  background-color: #fff;
}
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>