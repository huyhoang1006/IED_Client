import {mapState} from 'vuex'
import uuid from '@/utils/uuid/index.js'
import OrganisationDto from '@/views/Dto/Organisation/index.js'
import * as orgMapper from '@/views/Mapping/Organisation/index.js'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent/index.js'

export default {
    data() {
        return {
            properties : new OrganisationDto(),
            attachmentData : [],
            isSaving: false, // Guard to prevent duplicate saves
        }
    },
    methods: {
        async saveCtrS() {
            const data = await this.saveOrganisation()
            if(data.success) {
                this.$message.success("Organisation saved successfully")
            } else {
                this.$message.error("Failed to save organisation")
            }
        },

        resetForm() {
            this.properties = new OrganisationDto()
            this.attachmentData = []
        },

        async loadData(data) {
            // Merge data into existing properties instead of replacing it
            // This preserves all OrganisationDto fields even if data is incomplete
            if (data) {
                // Handle organisationId/mrid mapping
                if (data.organisationId) {
                    this.properties.organisationId = data.organisationId
                } else if (data.mrid) {
                    this.properties.organisationId = data.mrid
                }
                
                // Helper function to convert null to empty string for string fields
                const convertNullToString = (value, key) => {
                    // For string fields, convert null to empty string to avoid displaying "null" in UI
                    if (value === null && typeof this.properties[key] === 'string') {
                        return ''
                    }
                    return value
                }
                
                // Merge all other properties
                Object.keys(data).forEach(key => {
                    if (key !== 'mrid' && data[key] !== undefined) {
                        // Handle department and position specially - always convert null to empty string
                        if (key === 'department' || key === 'position') {
                            this.properties[key] = (data[key] === null || data[key] === undefined) ? '' : data[key]
                            return
                        }
                        
                        // Handle nested objects like positionPoints and attachment
                        if (key === 'positionPoints' && typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                            this.properties.positionPoints = {
                                x: Array.isArray(data[key].x) ? data[key].x : [],
                                y: Array.isArray(data[key].y) ? data[key].y : [],
                                z: Array.isArray(data[key].z) ? data[key].z : []
                            }
                        } else if (key === 'attachment' && typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                            // Ensure this.properties.attachment exists before spreading
                            // Also convert null values in attachment object to empty strings
                            const cleanAttachment = {}
                            Object.keys(data[key]).forEach(attrKey => {
                                cleanAttachment[attrKey] = data[key][attrKey] === null ? '' : data[key][attrKey]
                            })
                            if (this.properties.attachment && typeof this.properties.attachment === 'object') {
                                this.properties.attachment = { ...this.properties.attachment, ...cleanAttachment }
                            } else {
                                this.properties.attachment = { ...cleanAttachment }
                            }
                        } else if (data[key] !== null) {
                            // For non-null values, assign directly
                            this.properties[key] = data[key]
                        } else {
                            // For null values, convert to empty string for string fields to avoid displaying "null"
                            this.properties[key] = convertNullToString(data[key], key)
                        }
                    }
                })
            }
            
            // Ensure positionPoints is initialized
            if (!this.properties.positionPoints) {
                this.properties.positionPoints = {
                    x: [],
                    y: [],
                    z: []
                }
            } else {
                if (!this.properties.positionPoints.x) this.properties.positionPoints.x = []
                if (!this.properties.positionPoints.y) this.properties.positionPoints.y = []
                if (!this.properties.positionPoints.z) this.properties.positionPoints.z = []
            }
            
            // Ensure configurationEvent is an array
            if (!Array.isArray(this.properties.configurationEvent)) {
                this.properties.configurationEvent = []
            }
            
            // Clean up: Convert all null string values to empty strings to avoid displaying "null" in UI
            // List of string fields that should be empty string instead of null
            const stringFields = [
                'name', 'street', 'ward_or_commune', 'district_or_town', 'city', 
                'state_or_province', 'tax_code', 'country', 'phoneNumber', 
                'email', 'fax', 'comment', 'personName', 'personId', 'department', 
                'position', 'organisationId', 'telephoneNumberId', 'attachmentId',
                'streetDetailId', 'streetAddressId', 'electronicAddressId', 
                'townDetailId', 'parentId', 'personRoleId', 'userId', 'userName'
            ]
            
            stringFields.forEach(key => {
                if (this.properties[key] === null || this.properties[key] === undefined) {
                    this.properties[key] = ''
                }
            })
            
            // Ensure department and position are explicitly set from data if they exist
            // This handles the case where department/position come from top-level data
            if (data) {
                // Always set department and position, even if null/undefined
                if (data.department !== undefined) {
                    this.properties.department = (data.department === null || data.department === undefined) ? '' : String(data.department)
                } else if (this.properties.department === null || this.properties.department === undefined) {
                    this.properties.department = ''
                }
                
                if (data.position !== undefined) {
                    this.properties.position = (data.position === null || data.position === undefined) ? '' : String(data.position)
                } else if (this.properties.position === null || this.properties.position === undefined) {
                    this.properties.position = ''
                }
            } else {
                // If no data, ensure empty strings
                if (this.properties.department === null || this.properties.department === undefined) {
                    this.properties.department = ''
                }
                if (this.properties.position === null || this.properties.position === undefined) {
                    this.properties.position = ''
                }
            }
            
            // Handle attachment data
            if (data && data.attachment && data.attachment.path) {
                try {
                    this.attachmentData = JSON.parse(data.attachment.path)
                } catch (e) {
                    console.error('Error parsing attachment path:', e)
                    this.attachmentData = []
                }
            } else {
                this.attachmentData = []
            }

            
            // Load department and position from personRole if personId exists and values are not already set
            if (this.properties.personId && this.properties.personId !== '') {
                try {
                    const personRoleData = await window.electronAPI.getPersonRoleByPersonId(this.properties.personId)
                    if (personRoleData.success && personRoleData.data) {
                        // Only update if current values are truly empty (not set from data)
                        const dataHadDepartment = data && data.department !== undefined
                        const dataHadPosition = data && data.position !== undefined
                        
                        if (!dataHadDepartment && (!this.properties.department || this.properties.department === '')) {
                            this.properties.department = personRoleData.data.department ? String(personRoleData.data.department) : ''
                        }
                        if (!dataHadPosition && (!this.properties.position || this.properties.position === '')) {
                            this.properties.position = personRoleData.data.position ? String(personRoleData.data.position) : ''
                        }
                        if (!this.properties.personRoleId || this.properties.personRoleId === '') {
                            this.properties.personRoleId = personRoleData.data.mrid || ''
                        }
                    }
                } catch (error) {
                    console.error('Error loading person role data:', error)
                }
            }
            
            // Final check: Ensure department and position are always strings (not null/undefined)
            if (this.properties.department === null || this.properties.department === undefined) {
                this.properties.department = ''
            }
            if (this.properties.position === null || this.properties.position === undefined) {
                this.properties.position = ''
            }
        },

        async saveOrganisation() {
            // Prevent duplicate saves
            if (this.isSaving) {
                console.warn('Save already in progress, ignoring duplicate save request');
                return { success: false, message: 'Save already in progress' };
            }
            
            if(this.properties.name === '') {
                this.$message.error("Name is required")
                return
            } else {
                this.isSaving = true; // Set flag to prevent duplicate saves
                try {
                    // Check mode to decide insert or update BEFORE modifying organisationId
                    const isEditMode = this.mode === this.$constant.EDIT || 
                                      (this.properties.organisationId && 
                                       this.properties.organisationId !== '' &&
                                       this.properties.organisationId !== '00000000-0000-0000-0000-000000000000')
                    
                    if(!isEditMode) {
                        // Only generate new UUID for insert mode
                        if(this.properties.organisationId === null || this.properties.organisationId === '') {
                            this.properties.organisationId = uuid.newUuid()
                        }
                    } else {
                        // For edit mode, ensure organisationId is valid
                        if(!this.properties.organisationId || 
                           this.properties.organisationId === '' || 
                           this.properties.organisationId === '00000000-0000-0000-0000-000000000000') {
                            this.$message.error("Invalid organisation ID for update")
                            return { success: false }
                        }
                    }
                    
                    // Set parentId: if not provided, use parent prop, otherwise use ROOT_ID
                    if(this.properties.parentId === null || this.properties.parentId === '') {
                        const ROOT_ID = this.$constant?.ROOT || '00000000-0000-0000-0000-000000000000'
                        this.properties.parentId = this.parent ? this.parent.mrid : ROOT_ID
                    }
                    const dto = JSON.parse(JSON.stringify(this.properties))
                    const dtoData = this.checkOrganisation(dto)
                    
                    const data = orgMapper.OrgDtoToOrgEntity(dtoData)
                    
                    // Validate that mrid exists for update
                    if (isEditMode && (!data.organisation.mrid || data.organisation.mrid === '')) {
                        this.$message.error("Organisation ID is required for update")
                        return { success: false }
                    }
                    
                    let result
                    if (isEditMode) {
                        // Update existing organisation
                        result = await window.electronAPI.updateParentOrganizationEntity(data)
                    } else {
                        // Insert new organisation
                        result = await window.electronAPI.insertParentOrganizationEntity(data)
                    }
                    
                    if(result.success) {
                        // Load lại entity từ database để lấy đầy đủ thông tin (bao gồm department và position)
                        try {
                            const loadedEntity = await window.electronAPI.getOrganisationEntityByMrid(this.properties.organisationId)
                            if (loadedEntity && loadedEntity.success && loadedEntity.data) {
                                const dto = orgMapper.OrgEntityToOrgDto(loadedEntity.data)
                                
                                // Update properties với dữ liệu từ database
                                this.properties.department = dto.department || ''
                                this.properties.position = dto.position || ''
                                this.properties.personRoleId = dto.personRoleId || ''
                                
                                // Return loaded data
                                return {
                                    data: loadedEntity.data,
                                    success: true
                                }
                            }
                        } catch (loadError) {
                            console.error('Error loading entity after save:', loadError)
                            // Fallback to result data if load fails
                        }
                        
                        // Return properties if result.data is null/undefined to avoid logging "null"
                        const returnData = result.data || {
                            organisation: {
                                mrid: this.properties.organisationId,
                                name: this.properties.name
                            }
                        }
                        return {
                            data: returnData,
                            success: true
                        }
                    } else {
                        this.$message.error('Error saving organisation: ' + (result.message || 'Unknown error'))
                        return {
                            success: false
                        }
                    }

                } catch (err) {
                    this.$message.error('Error saving organisation: ' + (err?.message || 'Unknown error'))
                    return {success : false}
                } finally {
                    this.isSaving = false; // Reset flag after save completes
                }
            }
        },
        
        checkElectronicAddress(dto) {
            if(dto.electronicAddressId === null || dto.electronicAddressId === '') {
                if(dto.email === '' && dto.fax === '') {
                    dto.electronicAddressId = null
                } else {
                    dto.electronicAddressId = uuid.newUuid()
                }
            }
        },

        checkTelephoneNumber(dto) {
            if(dto.telephoneNumberId === null || dto.telephoneNumberId === '') {
                if(dto.phoneNumber === '') {
                    dto.telephoneNumberId = null
                } else {
                    dto.telephoneNumberId = uuid.newUuid()
                }
            }
        },

        
        checkStreetDetail(dto) {
            if (dto.streetDetailId === null || dto.streetDetailId === '') {
                if(dto.street === '') {
                    dto.streetDetailId = null
                } else {
                    dto.streetDetailId = uuid.newUuid()
                }
            }
        },

        checkTownDetail(dto) {
            if(dto.townDetailId === null || dto.townDetailId === '') {
                if(dto.city === '' && dto.state_or_province === '' &&
                    dto.country === '' && dto.district_or_town === '' &&
                    dto.ward_or_commune === '') {
                    dto.townDetailId = null
                } else {
                    dto.townDetailId = uuid.newUuid()
                }
            }
        },

        checkStreetAddress(dto) {
            if(dto.streetAddressId === null || dto.streetAddressId === '') {
                if((dto.streetDetailId === null || dto.streetDetailId === '') && (dto.townDetailId === null || dto.townDetailId === '')) {
                    dto.streetAddressId = null
                } else {
                    dto.streetAddressId = uuid.newUuid()
                }
            }
        },

        checkPositionPoint(dto) {
            if (!dto.positionPoints) {
                dto.positionPoints = {
                    x: [],
                    y: [],
                    z: []
                }
                return
            }
            if (!dto.positionPoints.x || !dto.positionPoints.y || !dto.positionPoints.z) {
                if (!dto.positionPoints.x) dto.positionPoints.x = []
                if (!dto.positionPoints.y) dto.positionPoints.y = []
                if (!dto.positionPoints.z) dto.positionPoints.z = []
                return
            }
            if (dto.positionPoints.x.length !== 0) {
                dto.positionPoints.x.forEach((element, index) => {
                    if (element.id === null || element.id === '') {
                        element.id = uuid.newUuid()
                    }
                    if (dto.positionPoints.y[index] && (dto.positionPoints.y[index].id === null || dto.positionPoints.y[index].id === '')) {
                        dto.positionPoints.y[index].id = uuid.newUuid()
                    }
                    if (dto.positionPoints.z[index] && (dto.positionPoints.z[index].id === null || dto.positionPoints.z[index].id === '')) {
                        dto.positionPoints.z[index].id = uuid.newUuid()
                    }
                });
            }
        },

        checkConfigurationEvent(dto) {
            if(dto.organisationId !== null && dto.organisationId !== '') {
                // Ensure configurationEvent is an array
                if (!Array.isArray(dto.configurationEvent)) {
                    dto.configurationEvent = []
                }
                const configEventAttachment = new ConfigurationEvent()
                configEventAttachment.mrid = uuid.newUuid()
                configEventAttachment.name = 'Change organisation'
                configEventAttachment.effective_date_time = new Date().toISOString()
                configEventAttachment.changed_organisation = dto.organisationId
                configEventAttachment.user_name = this.$store.state.user.name
                configEventAttachment.modified_by = this.$store.state.user.user_id
                if(this.mode === this.$constant.ADD) {
                    configEventAttachment.type = "INSERT"
                } else if(this.mode === this.$constant.EDIT) {
                    configEventAttachment.type = "UPDATE"
                }
                configEventAttachment.description = `Organisation changed of ${dto.name}`
                dto.configurationEvent.push(configEventAttachment)
            }
        },
        
        checkUser(dto) {
            dto.user_id = this.$store.state.user.user_id
            dto.user_name = this.$store.state.user.name
        },

        checkPerson(dto) {
            // Tạo personId nếu chưa có nhưng có personName
            if(dto.personId === null || dto.personId === '') {
                if(dto.personName !== '' && dto.personName !== null) {
                    dto.personId = uuid.newUuid()
                } else {
                    dto.personId = null
                }
            }
        },

        checkPersonRole(dto) {
            // Tạo personRoleId nếu chưa có nhưng có department hoặc position
            if(dto.personRoleId === null || dto.personRoleId === '') {
                if((dto.department !== '' && dto.department !== null) || 
                   (dto.position !== '' && dto.position !== null)) {
                    dto.personRoleId = uuid.newUuid()
                } else {
                    dto.personRoleId = null
                }
            }
        },

        checkAttachment(dto) {

            if(dto.attachmentId === null || dto.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    dto.attachmentId = uuid.newUuid()
                    dto.attachment.id = dto.attachmentId
                    dto.attachment.name = null
                    dto.attachment.path = JSON.stringify(this.attachmentData)
                    dto.attachment.type = 'organisation'
                    dto.attachment.id_foreign = this.properties.organisationId
                }
            } 
        },

        checkOrganisation(dto) {
            this.checkElectronicAddress(dto)
            this.checkTelephoneNumber(dto)
            this.checkPerson(dto)
            this.checkPersonRole(dto)
            this.checkStreetDetail(dto)
            this.checkTownDetail(dto)
            this.checkStreetAddress(dto)
            this.checkPositionPoint(dto)
            this.checkAttachment(dto)
            this.checkUser(dto)
            this.checkConfigurationEvent(dto)
            return dto
        }
        
    }
}