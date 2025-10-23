/* eslint-disable */
import {mapState} from 'vuex'
import uuid from '@/utils/uuid.js'
import OrganisationDto from '@/views/Dto/Organisation/index.js'
import * as orgMapper from '@/views/Mapping/Organisation/index.js'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent/index.js'

export default {
    data() {
        return {
            properties : new OrganisationDto(),
            attachmentData : [],
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

        loadData(data) {
            // Ensure all properties are properly set
            this.properties = {
                organisationId: data.organisationId || '',
                name: data.name || '',
                tax_code: data.tax_code || '',
                street: data.street || '',
                ward_or_commune: data.ward_or_commune || '',
                district_or_town: data.district_or_town || '',
                city: data.city || '',
                state_or_province: data.state_or_province || '',
                country: data.country || '',
                phoneNumber: data.phoneNumber || '',
                fax: data.fax || '',
                email: data.email || '',
                comment: data.comment || '',
                parentId: data.parentId || '',
                mode: data.mode || 'organisation',
                x_position: data.x_position || '',
                y_position: data.y_position || '',
                z_position: data.z_position || '',
                positionPoints: data.positionPoints || { x: [], y: [], z: [] },
                electronicAddressId: data.electronicAddressId || '',
                telephoneNumberId: data.telephoneNumberId || '',
                streetDetailId: data.streetDetailId || '',
                townDetailId: data.townDetailId || '',
                streetAddressId: data.streetAddressId || '',
                attachmentId: data.attachmentId || '',
                attachment: data.attachment || {
                    id: '',
                    name: null,
                    path: '',
                    type: 'organisation',
                    id_foreign: ''
                },
                configurationEvent: data.configurationEvent || [],
                user_id: data.user_id || '',
                user_name: data.user_name || ''
            }
            
            // Handle attachment data
            if(data.attachment && data.attachment.path) {
                try {
                    this.attachmentData = JSON.parse(data.attachment.path)
                } catch (e) {
                    console.warn("Failed to parse attachment path:", e)
                    this.attachmentData = []
                }
            } else {
                this.attachmentData = []
            }
            
        },

        async saveOrganisation() {
            if(this.properties.name === '') {
                this.$message.error("Name is required")
                return
            } else {
                try {
                    if(this.properties.organisationId === null || this.properties.organisationId === '') {
                        this.properties.organisationId = uuid.newUuid()
                    }
                    if(this.properties.parentId === null || this.properties.parentId === '') {
                        this.properties.parentId = this.parent ? this.parent.mrid : null
                    }
                    const dto = JSON.parse(JSON.stringify(this.properties))
                    const dtoData = this.checkOrganisation(dto)
                    const data = orgMapper.OrgDtoToOrgEntity(dtoData)
                    const result = await window.electronAPI.insertParentOrganizationEntity(data)
                    if(result.success) {
                        // Emit event để thông báo cho parent component
                        this.$emit('organisation-saved', {
                            id: this.properties.organisationId,
                            mrid: this.properties.organisationId,
                            name: this.properties.name,
                            mode: this.properties.mode || 'organisation',
                            parentId: this.properties.parentId,
                            parentName: this.parent ? this.parent.name : 'Root'
                        })
                        
                        return {
                            data: result.data,
                            success: true
                        }
                    } else {
                        console.error('Full API error result:', result)
                        this.$message.error('Error saving organisation: ' + (result.message || result.err || 'Unknown error'))
                        console.error('Error saving organisation:', result.message || result.err)
                        return {
                            success: false
                        }
                    }

                } catch (err) {
                    console.error('Error saving organisation:', err)
                    return {success : false}
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
            if (dto.positionPoints.x.length !== 0) {
                dto.positionPoints.x.forEach((element, index) => {
                    if (element.id === null || element.id === '') {
                        element.id = uuid.newUuid()
                    }
                    if (dto.positionPoints.y[index].id === null || dto.positionPoints.y[index].id === '') {
                        dto.positionPoints.y[index].id = uuid.newUuid()
                    }
                    if (dto.positionPoints.z[index].id === null || dto.positionPoints.z[index].id === '') {
                        dto.positionPoints.z[index].id = uuid.newUuid()
                    }
                });
            }
        },

        checkConfigurationEvent(dto) {
            if(dto.organisationId !== null && dto.organisationId !== '') {
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
            this.checkStreetDetail(dto)
            this.checkTownDetail(dto)
            this.checkStreetAddress(dto)
            this.checkPositionPoint(dto)
            this.checkAttachment(dto)
            this.checkUser(dto)
            this.checkConfigurationEvent(dto)
            return dto
        },

        // Test method to demonstrate DTO <-> Entity conversion
        testConversion() {
            console.log("=== Testing DTO -> Entity Conversion ===")
            const dto = this.properties
            console.log("Original DTO:", dto)
            
            const entity = orgMapper.OrgDtoToOrgEntity(dto)
            console.log("Converted to Entity:", entity)
            
            console.log("=== Testing Entity -> DTO Conversion ===")
            const backToDto = orgMapper.OrgEntityToOrgDto(entity)
            console.log("Converted back to DTO:", backToDto)
            
            this.$message.success("Check console for conversion results")
        }
        
    }
}