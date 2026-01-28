import db from '../../datacontext/index.js'
import * as attachmentContext from '../../attachmentcontext/index.js'
import path from 'path'
import { insertSubstationTransaction, getSubstationById, deleteSubstationByIdTransaction } from '../../cim/substation/index.js'
import { insertStreetDetailTransaction, getStreetDetailById, deleteStreetDetailByIdTransaction } from '../../cim/streetDetail/index.js'
import { insertTownDetailTransaction, getTownDetailById, deleteTownDetailByIdTransaction } from '../../cim/townDetail/index.js'
import { insertStreetAddressTransaction, getStreetAddressById, deleteStreetAddressByIdTransaction } from '../../cim/streetAddress/index.js'
import { insertLocationTransaction, getLocationById, deleteLocationByIdTransaction } from '../../cim/location/index.js'
import { insertElectronicAddressTransaction, getElectronicAddressById, deleteElectronicAddressByIdTransaction } from '../../cim/electronicAddress/index.js'
import { insertTelephoneNumberTransaction, getTelephoneNumberById, deleteTelephoneNumberByIdTransaction } from '../../cim/telephoneNumber/index.js'
import { insertPersonTransaction, getPersonById, deletePersonByIdTransaction } from '../../cim/person/index.js'
import { insertPersonRoleTransaction, getPersonRoleByPersonId, deletePersonRoleByIdTransaction } from '../../cim/personRole/index.js'
import { insertUserTransaction, getUserById } from '../user/index.js'
import { insertUserIdentifiedObjectTransaction, getUserIdentifiedObjectByUserIdAndIdentifiedObjectId, deleteUserIdentifiedObjectByMrid } from '../userIdentifiedObject/index.js'
import { insertPersonSubstationTransaction, getPersonSubstationBySubstationId, deletePersonSubstationByMrid  } from '../personSubstation/index.js'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '../attachment/index.js'
import { insertOrganisationLocationTransaction, getOrganisationLocationByOrganisationIdAndLocationId, deleteOrganisationLocationById } from '../organisationLocation/index.js'
import { insertPositionPointArrayTransaction, getPositionPointByLocationId, deletePositionPointByLocationIdTransaction } from '../../cim/positionPoint/index.js'
import { insertPsrTypeTransaction, getPsrTypeById, deletePsrTypeByIdTransaction } from '../../cim/psrType/index.js'
import { insertOrganisationPersonTransaction, getOrganisationPersonByOrganisationIdAndPersonId, deleteOrganisationPersonById } from '../organisationPerson/index.js'
import { insertOrganisationPsrTransaction, getOrganisationPsrByOrganisationIdAndPsrId, deleteOrganisationPsrById } from '../organisationPsr/index.js'
import { insertConfigurationEventArrayTransaction, insertConfigurationEventTransaction, deleteConfigurationEventByIdTransaction } from '../../cim/configurationEvent/index.js'
import { getPowerSystemResourceByLocationIdTransaction } from '../../cim/powerSystemResource/index.js'
import ConfigurationEvent from '../../../views/Cim/ConfigurationEvent/index.js'
import uuid from '../../../utils/uuid.js'
import SubstationEntity from '../../../views/Entity/Substation/index.js'

// Insert SubstationEntity
export const insertSubstationEntity = async (entity) => {
    if(entity == null || typeof entity !== 'object') {
        return { success: false, error: new Error('Invalid entity data') };
    } else if (entity.substation.mrid == null || entity.substation.mrid === '') {
        return { success: false, error: new Error('Entity must have a valid MRID') };
    } else {
        const result = {
            success: false,
            error: null,
            message: '',
        };
        try {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                backupAllFilesInDir(null, null, entity.substation.mrid);
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.substation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.substation.mrid);
                    result.error = syncResult.error;
                    result.message = 'Failed syncing files';
                    const configEvent = new ConfigurationEvent();
                    configEvent.mrid = uuid.newUuid()
                    configEvent.name = 'Change Attachment'
                    configEvent.effective_date_time = new Date().toISOString()
                    configEvent.changed_attachment = entity.attachmentId
                    configEvent.user_name = entity.user.name
                    configEvent.modified_by = entity.user.user_id
                    configEvent.type = "ERROR"
                    configEvent.description = `Attachment changed of ${entity.name}`
                    try {
                        await insertConfigurationEventTransaction(configEvent, db);
                    } catch (err) {
                        console.error('Insert ConfigurationEvent failed:', err);
                    }
                    return result;
                }
                
                await new Promise((resolve, reject) => {
                    db.serialize(async () => {
                        db.run('BEGIN TRANSACTION');
                        try {
                            if (entity.psrType.mrid) await insertPsrTypeTransaction(entity.psrType, db);
                            if (entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db);
                            if (entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db);
                            if (entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db);
                            if (entity.location.mrid) await insertLocationTransaction(entity.location, db);
                            if (entity.substation.mrid) await insertSubstationTransaction(entity.substation, db);
                            if (entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db);
                            if (entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                            // Insert person nếu có mrid hoặc có name (tạo mrid nếu chưa có)
                            if (entity.person && (entity.person.mrid || entity.person.name)) {
                                if (!entity.person.mrid && entity.person.name) {
                                    entity.person.mrid = uuid.newUuid();
                                }
                                if (entity.person.mrid) {
                                    await insertPersonTransaction(entity.person, db);
                                }
                            }
                            // Insert personRole nếu có mrid hoặc có department/position (tạo mrid nếu chưa có)
                            if (entity.personRole) {
                                const hasDepartment = entity.personRole.department && typeof entity.personRole.department === 'string' && entity.personRole.department.trim() !== '';
                                const hasPosition = entity.personRole.position && typeof entity.personRole.position === 'string' && entity.personRole.position.trim() !== '';
                                const hasMrid = entity.personRole.mrid && typeof entity.personRole.mrid === 'string' && entity.personRole.mrid.trim() !== '';
                                
                                if (hasDepartment || hasPosition || hasMrid) {
                                    // Tạo mrid nếu chưa có nhưng có department hoặc position
                                    if (!hasMrid && (hasDepartment || hasPosition)) {
                                        entity.personRole.mrid = uuid.newUuid();
                                    }
                                    // Đảm bảo personRole.person được set nếu có person.mrid
                                    if (entity.personRole.mrid && !entity.personRole.person && entity.person && entity.person.mrid) {
                                        entity.personRole.person = entity.person.mrid;
                                    }
                                    if (entity.personRole.mrid) {
                                        await insertPersonRoleTransaction(entity.personRole, db);
                                    }
                                }
                            }
                            if (entity.user.user_id) await insertUserTransaction(entity.user, db);
                            if (entity.userIdentifiedObject.mrid) await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject, db);
                            // Insert personSubstation nếu có person.mrid và substation.mrid
                            if (entity.personSubstation && entity.person && entity.person.mrid && entity.substation && entity.substation.mrid) {
                                if (!entity.personSubstation.mrid) {
                                    entity.personSubstation.mrid = uuid.newUuid();
                                }
                                if (!entity.personSubstation.substation_id) {
                                    entity.personSubstation.substation_id = entity.substation.mrid;
                                }
                                if (!entity.personSubstation.person_id) {
                                    entity.personSubstation.person_id = entity.person.mrid;
                                }
                                if (entity.personSubstation.mrid) {
                                    await insertPersonSubstationTransaction(entity.personSubstation, db);
                                }
                            }
                            // Insert organisationLocation nếu có organisation_id và location_id
                            if (entity.organisationLocation && entity.organisationLocation.organisation_id && entity.location && entity.location.mrid) {
                                if (!entity.organisationLocation.mrid) {
                                    entity.organisationLocation.mrid = uuid.newUuid();
                                }
                                if (!entity.organisationLocation.location_id) {
                                    entity.organisationLocation.location_id = entity.location.mrid;
                                }
                                if (entity.organisationLocation.mrid) {
                                    await insertOrganisationLocationTransaction(entity.organisationLocation, db);
                                }
                            }
                            // Insert organisationPsr nếu có organisation_id và substation.mrid
                            if (entity.organisationPsr && entity.organisationPsr.organisation_id && entity.substation && entity.substation.mrid) {
                                if (!entity.organisationPsr.mrid) {
                                    entity.organisationPsr.mrid = uuid.newUuid();
                                }
                                if (!entity.organisationPsr.psr_id) {
                                    entity.organisationPsr.psr_id = entity.substation.mrid;
                                }
                                if (entity.organisationPsr.mrid) {
                                    await insertOrganisationPsrTransaction(entity.organisationPsr, db);
                                }
                            }
                            // Insert organisationPerson nếu có organisation_id và person_id
                            if (entity.organisationPerson && entity.organisationPerson.organisation_id && entity.person && entity.person.mrid) {
                                if (!entity.organisationPerson.mrid) {
                                    entity.organisationPerson.mrid = uuid.newUuid();
                                }
                                if (!entity.organisationPerson.person_id) {
                                    entity.organisationPerson.person_id = entity.person.mrid;
                                }
                                if (entity.organisationPerson.mrid) {
                                    await insertOrganisationPersonTransaction(entity.organisationPerson, db);
                                }
                            }
                            if (Array.isArray(entity.positionPoint) && entity.positionPoint.length > 0) await insertPositionPointArrayTransaction(entity.positionPoint, entity.location.mrid, db);
                            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                                const pathData = JSON.parse(entity.attachment.path);
                                const newPath = []
                                for(let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.substation.mrid, namefile);
                                    newPath.push(pathData[i]);
                                }
                                entity.attachment.path = JSON.stringify(newPath);
                                await uploadAttachmentTransaction(entity.attachment, db);
                            }
                            if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0)  await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                            db.run('COMMIT');
                            resolve({ success: true, data: entity, message: 'Insert entity completed' });
                        } catch (err) {
                            db.run('ROLLBACK');
                            reject({ success: false, err, message: 'Insert entity failed' });
                        }
                    })
                })
                deleteBackupFiles(null, entity.substation.mrid);
                result.success = true;
                result.data = entity;
                result.message = 'Insert SubstationEntity completed';
            } else {
                await new Promise((resolve, reject) => {
                    db.serialize(async () => {
                        db.run('BEGIN TRANSACTION');
                        try {
                            if (entity.psrType.mrid) await insertPsrTypeTransaction(entity.psrType, db);
                            if (entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db);
                            if (entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db);
                            if (entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db);
                            if (entity.location.mrid) await insertLocationTransaction(entity.location, db);
                            if (entity.substation.mrid) await insertSubstationTransaction(entity.substation, db);
                            if (entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db);
                            if (entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                            // Insert person nếu có mrid hoặc có name (tạo mrid nếu chưa có)
                            if (entity.person && (entity.person.mrid || entity.person.name)) {
                                if (!entity.person.mrid && entity.person.name) {
                                    entity.person.mrid = uuid.newUuid();
                                }
                                if (entity.person.mrid) {
                                    await insertPersonTransaction(entity.person, db);
                                }
                            }
                            // Insert personRole nếu có mrid hoặc có department/position (tạo mrid nếu chưa có)
                            if (entity.personRole) {
                                const hasDepartment = entity.personRole.department && typeof entity.personRole.department === 'string' && entity.personRole.department.trim() !== '';
                                const hasPosition = entity.personRole.position && typeof entity.personRole.position === 'string' && entity.personRole.position.trim() !== '';
                                const hasMrid = entity.personRole.mrid && typeof entity.personRole.mrid === 'string' && entity.personRole.mrid.trim() !== '';
                                
                                if (hasDepartment || hasPosition || hasMrid) {
                                    // Tạo mrid nếu chưa có nhưng có department hoặc position
                                    if (!hasMrid && (hasDepartment || hasPosition)) {
                                        entity.personRole.mrid = uuid.newUuid();
                                    }
                                    // Đảm bảo personRole.person được set nếu có person.mrid
                                    if (entity.personRole.mrid && !entity.personRole.person && entity.person && entity.person.mrid) {
                                        entity.personRole.person = entity.person.mrid;
                                    }
                                    if (entity.personRole.mrid) {
                                        await insertPersonRoleTransaction(entity.personRole, db);
                                    }
                                }
                            }
                            if (entity.user.user_id) await insertUserTransaction(entity.user, db);
                            if (entity.userIdentifiedObject.mrid) await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject, db);
                            // Insert personSubstation nếu có person.mrid và substation.mrid
                            if (entity.personSubstation && entity.person && entity.person.mrid && entity.substation && entity.substation.mrid) {
                                if (!entity.personSubstation.mrid) {
                                    entity.personSubstation.mrid = uuid.newUuid();
                                }
                                if (!entity.personSubstation.substation_id) {
                                    entity.personSubstation.substation_id = entity.substation.mrid;
                                }
                                if (!entity.personSubstation.person_id) {
                                    entity.personSubstation.person_id = entity.person.mrid;
                                }
                                if (entity.personSubstation.mrid) {
                                    await insertPersonSubstationTransaction(entity.personSubstation, db);
                                }
                            }
                            // Insert organisationLocation nếu có organisation_id và location_id
                            if (entity.organisationLocation && entity.organisationLocation.organisation_id && entity.location && entity.location.mrid) {
                                if (!entity.organisationLocation.mrid) {
                                    entity.organisationLocation.mrid = uuid.newUuid();
                                }
                                if (!entity.organisationLocation.location_id) {
                                    entity.organisationLocation.location_id = entity.location.mrid;
                                }
                                if (entity.organisationLocation.mrid) {
                                    await insertOrganisationLocationTransaction(entity.organisationLocation, db);
                                }
                            }
                            // Insert organisationPsr nếu có organisation_id và substation.mrid
                            if (entity.organisationPsr && entity.organisationPsr.organisation_id && entity.substation && entity.substation.mrid) {
                                if (!entity.organisationPsr.mrid) {
                                    entity.organisationPsr.mrid = uuid.newUuid();
                                }
                                if (!entity.organisationPsr.psr_id) {
                                    entity.organisationPsr.psr_id = entity.substation.mrid;
                                }
                                if (entity.organisationPsr.mrid) {
                                    await insertOrganisationPsrTransaction(entity.organisationPsr, db);
                                }
                            }
                            // Insert organisationPerson nếu có organisation_id và person_id
                            if (entity.organisationPerson && entity.organisationPerson.organisation_id && entity.person && entity.person.mrid) {
                                if (!entity.organisationPerson.mrid) {
                                    entity.organisationPerson.mrid = uuid.newUuid();
                                }
                                if (!entity.organisationPerson.person_id) {
                                    entity.organisationPerson.person_id = entity.person.mrid;
                                }
                                if (entity.organisationPerson.mrid) {
                                    await insertOrganisationPersonTransaction(entity.organisationPerson, db);
                                }
                            }
                            if (Array.isArray(entity.positionPoint) && entity.positionPoint.length > 0) await insertPositionPointArrayTransaction(entity.positionPoint, entity.location.mrid, db);
                            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                                const pathData = JSON.parse(entity.attachment.path);
                                const newPath = []
                                for(let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), namefile);
                                    newPath.push(pathData[i]);
                                }
                                entity.attachment.path = JSON.stringify(newPath);
                                await uploadAttachmentTransaction(entity.attachment, db);
                            }
                            if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0)  await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                            db.run('COMMIT');
                            resolve({ success: true, data: entity, message: 'Insert entity completed' });
                        } catch (err) {
                            db.run('ROLLBACK');
                            reject({ success: false, err, message: 'Insert entity failed' });
                        }
                    })
                })
                result.success = true;
                result.data = entity;
                result.message = 'Insert SubstationEntity completed';      
            }
            return result;
        } catch (err) {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                try {
                    restoreFiles(null, null, entity.substation.mrid);
                } catch(err) {
                    result.error = err.message;
                    result.message = 'Insert SubstationEntity failed and rollback executed';
                    const configEvent = new ConfigurationEvent();
                    configEvent.mrid = uuid.newUuid()
                    configEvent.name = 'Change Attachment'
                    configEvent.effective_date_time = new Date().toISOString()
                    configEvent.changed_attachment = entity.attachmentId
                    configEvent.user_name = entity.user.name
                    configEvent.modified_by = entity.user.user_id
                    configEvent.type = "ERROR"
                    configEvent.description = `Attachment changed of ${entity.name}`
                    try {
                        await insertConfigurationEventTransaction(configEvent, db);
                    } catch (err) {
                        console.error('Insert ConfigurationEvent failed:', err);
                    }
                    return result;
                }
                    
            }
            result.error = err.message;
            result.message = 'Insert SubstationEntity failed and rollback executed';
            const configEvent = new ConfigurationEvent();
            configEvent.mrid = uuid.newUuid()
            configEvent.name = 'Change Attachment'
            configEvent.effective_date_time = new Date().toISOString()
            configEvent.changed_attachment = entity.attachmentId
            configEvent.user_name = entity.user.username
            configEvent.modified_by = entity.user.user_id
            configEvent.type = "ERROR"
            configEvent.description = `Attachment changed of ${entity.name}`
            try {
                await insertConfigurationEventTransaction(configEvent, db);
            } catch (err) {
                console.error('Insert ConfigurationEvent failed:', err);
            }
            return result;
        }
    }
}

// Get SubstationEntity by id
export const getSubstationEntityById = async (id, user_id, organisation_id) => {
    const entity = new SubstationEntity();
    if(id == null || id === '') {
        return { success: false, error: new Error('Invalid ID') };
    } else {
        try {
            const dataSubstation = await getSubstationById(id);
            if(dataSubstation.success) {
                entity.substation = dataSubstation.data;
                const dataPrsType = await getPsrTypeById(entity.substation.psr_type_id);
                if(dataPrsType.success) {
                    entity.psrType = dataPrsType.data;
                }

                const dataLocation = await getLocationById(entity.substation.location);
                if(dataLocation.success) {
                    entity.location = dataLocation.data;
                    
                    // Lấy StreetAddress nếu location có main_address
                    if(entity.location && entity.location.main_address) {
                        const dataStreetAddress = await getStreetAddressById(entity.location.main_address);
                        if(dataStreetAddress.success) {
                            entity.streetAddress = dataStreetAddress.data;
                            
                            // Lấy StreetDetail nếu streetAddress có street_detail
                            if(entity.streetAddress && entity.streetAddress.street_detail) {
                                const dataStreetDetail = await getStreetDetailById(entity.streetAddress.street_detail);
                                if(dataStreetDetail.success) {
                                    entity.streetDetail = dataStreetDetail.data;
                                }
                            }
                            
                            // Lấy TownDetail nếu streetAddress có town_detail
                            if(entity.streetAddress && entity.streetAddress.town_detail) {
                                const dataTownDetail = await getTownDetailById(entity.streetAddress.town_detail);
                                if(dataTownDetail.success) {
                                    entity.townDetail = dataTownDetail.data;
                                }
                            }
                        }
                    }
                }

                // Lấy PersonSubstation
                const dataPersonSubstation = await getPersonSubstationBySubstationId(entity.substation.mrid);
                if(dataPersonSubstation.success) {
                    entity.personSubstation = dataPersonSubstation.data;
                    
                    // Lấy Person nếu personSubstation có person_id
                    if(entity.personSubstation && entity.personSubstation.person_id) {
                        const dataPerson = await getPersonById(entity.personSubstation.person_id);
                        if(dataPerson.success) {
                            entity.person = dataPerson.data;
                            
                            // Lấy PersonRole nếu person có mrid
                            if(entity.person && entity.person.mrid) {
                                const dataPersonRole = await getPersonRoleByPersonId(entity.person.mrid);
                                if(dataPersonRole.success) {
                                    entity.personRole = dataPersonRole.data;
                                }
                            }
                            
                            // Lấy ElectronicAddress nếu person có electronic_address
                            if(entity.person && entity.person.electronic_address) {
                                const dataElectronicAddress = await getElectronicAddressById(entity.person.electronic_address);
                                if(dataElectronicAddress.success) {
                                    entity.electronicAddress = dataElectronicAddress.data;
                                }
                            }
                            
                            // Lấy TelephoneNumber nếu person có mobile_phone
                            if(entity.person && entity.person.mobile_phone) {
                                const dataTelephoneNumber = await getTelephoneNumberById(entity.person.mobile_phone);
                                if(dataTelephoneNumber.success) {
                                    entity.telephoneNumber = dataTelephoneNumber.data;
                                }
                            }
                        }
                    }
                }

                // Lấy PositionPoint nếu location có mrid
                if(entity.location && entity.location.mrid) {
                    const dataPositionPoint = await getPositionPointByLocationId(entity.location.mrid);
                    if(dataPositionPoint.success) {
                        entity.positionPoint = dataPositionPoint.data;
                    }
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.substation.mrid, 'substation');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const userIdentifiedObject = await getUserIdentifiedObjectByUserIdAndIdentifiedObjectId(user_id, entity.substation.mrid);
                if(userIdentifiedObject.success) {
                    entity.userIdentifiedObject = userIdentifiedObject.data;
                }

                const dataUser = await getUserById(user_id);
                if(dataUser.success) {
                    entity.user = dataUser.data;
                }

                // Lấy OrganisationLocation nếu có organisation_id và location.mrid
                if(organisation_id && entity.location && entity.location.mrid) {
                    const organisationLocation = await getOrganisationLocationByOrganisationIdAndLocationId(organisation_id, entity.location.mrid);
                    if(organisationLocation.success) {
                        entity.organisationLocation = organisationLocation.data;
                    }
                }

                // Lấy OrganisationPerson nếu có organisation_id và person.mrid
                if(organisation_id && entity.person && entity.person.mrid) {
                    const organisationPerson = await getOrganisationPersonByOrganisationIdAndPersonId(organisation_id, entity.person.mrid);
                    if(organisationPerson.success) {
                        entity.organisationPerson = organisationPerson.data;
                    }
                }

                const organisationPsr = await getOrganisationPsrByOrganisationIdAndPsrId(organisation_id, entity.substation.mrid);
                if(organisationPsr.success) {
                    entity.organisationPsr = organisationPsr.data;
                }

                return { success: true, data: entity, message: 'Substation entity retrieved successfully' };

            } else {
                return { success: false, error: new Error('Substation not found') };
            }
            
        } catch (error) {
            console.error('Error retrieving substation entity:', error);
            return { success: false, error, message: 'Error retrieving substation entity'};
        }
    }
}

// Delete SubstationEntity by id
export const deleteSubstationEntityById = async (data) => {
    try {
        // Xử lý trường hợp data là string (mrid) hoặc object
        let mrid = null;
        let entityData = data;
        
        if (typeof data === 'string') {
            // Nếu data là string, đó là mrid
            mrid = data;
            // Tạo entity object với mrid
            entityData = {
                substation: {
                    mrid: mrid
                }
            };
        } else if (data && typeof data === 'object') {
            // Nếu data là object, lấy mrid từ các vị trí có thể
            mrid = data.mrid || (data.substation && data.substation.mrid) || (data.id);
            
            // Nếu có mrid nhưng chưa có cấu trúc substation, tạo lại
            if (mrid && (!data.substation || !data.substation.mrid)) {
                entityData = {
                    ...data,
                    substation: {
                        ...(data.substation || {}),
                        mrid: mrid
                    }
                };
            } else {
                entityData = data;
            }
        }
        
        // Kiểm tra mrid hợp lệ
        if (!mrid || mrid === '') {
            return { success: false, error: new Error('Invalid ID: mrid is required') };
        }
        
        // Nếu chỉ có mrid, cố gắng load entity đầy đủ trước khi xóa
        if (!entityData.substation || !entityData.substation.mrid) {
            try {
                const entityResult = await getSubstationEntityById(mrid, null, null);
                if (entityResult.success && entityResult.data) {
                    entityData = entityResult.data;
                } else {
                    // Nếu không load được, vẫn xóa với dữ liệu tối thiểu
                    entityData = {
                        substation: {
                            mrid: mrid
                        }
                    };
                }
            } catch (loadErr) {
                // Nếu load thất bại, vẫn xóa với dữ liệu tối thiểu
                entityData = {
                    substation: {
                        mrid: mrid
                    }
                };
            }
        }
        
        if(entityData.substation == null || entityData.substation.mrid == null || entityData.substation.mrid === '') {
            return { success: false, error: new Error('Invalid ID: substation mrid is required') };
        } else {  
            try {
                await runSQL('BEGIN TRANSACTION');
                if(entityData.attachment && entityData.attachment.id) {
                    const pathData = JSON.parse(entityData.attachment.path || '[]')
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, entityData.substation.mrid);
                    }
                }
                if(entityData.attachment && entityData.attachment.id) {
                    await deleteAttachmentByIdTransaction(entityData.attachment.id, db);
                }
                if(entityData.substation && entityData.substation.mrid) {
                    await deleteSubstationByIdTransaction(entityData.substation.mrid, db);
                }
                if(entityData.psrType && entityData.psrType.mrid) {
                    await deletePsrTypeByIdTransaction(entityData.psrType.mrid, db);
                }
                if(entityData.location && entityData.location.mrid) {
                    const powerSystemResource = await getPowerSystemResourceByLocationIdTransaction(entityData.location.mrid, db);
                    if(powerSystemResource.success) {
                        if(powerSystemResource.data.length - 1 <= 0) {
                            await deleteLocationByIdTransaction(entityData.location.mrid, db);
                            if(entityData.streetAddress && entityData.streetAddress.mrid) {
                                await deleteStreetAddressByIdTransaction(entityData.streetAddress.mrid, db);
                            }
                            if(entityData.streetDetail && entityData.streetDetail.mrid) {
                                await deleteStreetDetailByIdTransaction(entityData.streetDetail.mrid, db);
                            }
                            if(entityData.townDetail && entityData.townDetail.mrid) {
                                await deleteTownDetailByIdTransaction(entityData.townDetail.mrid, db);
                            }
                        }
                    }
                }
                if(entityData.personRole && entityData.personRole.mrid) {
                    await deletePersonRoleByIdTransaction(entityData.personRole.mrid, db);
                }
                if(entityData.person && entityData.person.mrid) {
                    await deletePersonByIdTransaction(entityData.person.mrid, db);
                }
                if(entityData.electronicAddress && entityData.electronicAddress.mrid) {
                    await deleteElectronicAddressByIdTransaction(entityData.electronicAddress.mrid, db);
                }
                if(entityData.telephoneNumber && entityData.telephoneNumber.mrid) {
                    await deleteTelephoneNumberByIdTransaction(entityData.telephoneNumber.mrid, db);
                }
                // Xóa personSubstation
                if(entityData.personSubstation && entityData.personSubstation.mrid) {
                    await deletePersonSubstationByMrid(entityData.personSubstation.mrid);
                }
                // Xóa userIdentifiedObject
                if(entityData.userIdentifiedObject && entityData.userIdentifiedObject.mrid) {
                    await deleteUserIdentifiedObjectByMrid(entityData.userIdentifiedObject.mrid);
                }
                // Xóa organisationLocation
                if(entityData.organisationLocation && entityData.organisationLocation.mrid) {
                    await deleteOrganisationLocationById(entityData.organisationLocation.mrid);
                }
                // Xóa organisationPsr
                if(entityData.organisationPsr && entityData.organisationPsr.mrid) {
                    await deleteOrganisationPsrById(entityData.organisationPsr.mrid);
                }
                // Xóa organisationPerson
                if(entityData.organisationPerson && entityData.organisationPerson.mrid) {
                    await deleteOrganisationPersonById(entityData.organisationPerson.mrid);
                }
                // Xóa positionPoint nếu có location
                const locationIdToDelete = (entityData.location && entityData.location.mrid) || (entityData.substation && entityData.substation.location);
                if (locationIdToDelete) {
                    await deletePositionPointByLocationIdTransaction(locationIdToDelete, db);
                }
                // Xóa configurationEvent nếu có
                if(entityData.configurationEvent && Array.isArray(entityData.configurationEvent) && entityData.configurationEvent.length > 0) {
                    for(const event of entityData.configurationEvent) {
                        if(event.mrid) {
                            await deleteConfigurationEventByIdTransaction(event.mrid, db);
                        }
                    }
                }
                await runSQL('COMMIT');
                if(entityData.attachment && entityData.attachment.id) {
                    deleteDirectory(null, entityData.substation.mrid);
                }
                return { success: true, message: 'Substation entity deleted successfully' };
            } catch (err) {
                await runSQL('ROLLBACK');
                return { success: false, error: err, message: 'Substation entity deleted failed' };
            }
        }
    } catch (error) {
        console.error('Error deleting substation entity:', error);
        return { success: false, error, message: 'Error deleting substation entity' };
    }
}

// Run SQL
const runSQL = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};