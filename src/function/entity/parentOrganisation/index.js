import db from '../../datacontext/index.js'
import * as attachmentContext from '../../attachmentcontext/index.js'
import OrganisationEntity from '../../../views/Entity/Organisation/index.js'
import { insertStreetDetailTransaction, getStreetDetailById, deleteStreetDetailByIdTransaction, updateStreetDetailByIdTransaction } from '../../cim/streetDetail/index.js'
import { insertTownDetailTransaction, getTownDetailById, deleteTownDetailByIdTransaction, updateTownDetailByIdTransaction } from '../../cim/townDetail/index.js'
import { insertStreetAddressTransaction, getStreetAddressById, deleteStreetAddressByIdTransaction, updateStreetAddressByIdTransaction } from '../../cim/streetAddress/index.js'
import { insertElectronicAddressTransaction, getElectronicAddressById, deleteElectronicAddressByIdTransaction, updateElectronicAddressByIdTransaction } from '../../cim/electronicAddress/index.js'
import { insertTelephoneNumberTransaction, getTelephoneNumberById, deleteTelephoneNumberByIdTransaction, updateTelephoneNumberByIdTransaction } from '../../cim/telephoneNumber/index.js'
import { insertPersonTransaction, getPersonById, deletePersonByIdTransaction, updatePersonByIdTransaction } from '../../cim/person/index.js'
import { insertPersonRoleTransaction, getPersonRoleByPersonId, deletePersonRoleByIdTransaction, updatePersonRoleTransaction } from '../../cim/personRole/index.js'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, deleteDirectory, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction } from '../attachment/index.js'
import { insertConfigurationEventArrayTransaction, insertConfigurationEventTransaction} from '../../cim/configurationEvent/index.js'
import ConfigurationEvent from '../../../views/Cim/ConfigurationEvent/index.js'
import { insertParentOrganizationTransaction, getParentOrganizationById, getParentOrganizationByParentId, deleteParentOrganizationByIdTransaction, updateParentOrganizationTransaction } from '../../cim/parentOrganization/index.js'
import { insertGeoMapArrayTransaction, getGeoMapByOrganisationId, deleteGeoMapByArrayMridTransaction, updateGeoMapArrayByIdTransaction } from '../geoMap/index.js'
import { getOrganisationPersonByOrganisationId } from '../organisationPerson/index.js'
import uuid from '../../../utils/uuid.js'
import path from 'path'
import constant from '../../../utils/constant.js'

// Helper function to normalize and validate parent_organisation
const normalizeAndValidateParentOrganisation = async (parentOrgMrid, dbsql, currentMrid = null) => {
    const ROOT_ID = constant.ROOT;
    
    // If empty or null, return null (no parent)
    if (!parentOrgMrid || parentOrgMrid === '') {
        return null;
    }
    
    // ROOT_ID is a valid parent - keep it as is (don't convert to null)
    // Root organisation has mrid = ROOT_ID, and children of root should have parent_organisation = ROOT_ID
    if (parentOrgMrid === ROOT_ID) {
        return ROOT_ID;
    }
    
    // Prevent self-reference
    if (currentMrid && parentOrgMrid === currentMrid) {
        return null;
    }
    
    // Check if parent_organisation exists in organisation table (self-referential FK)
    // The foreign key constraint references organisation.mrid, not parent_organization.mrid
    return new Promise((resolve) => {
        dbsql.get(
            'SELECT mrid FROM organisation WHERE mrid = ?',
            [parentOrgMrid],
            (err, row) => {
                if (err) {
                    // On error, set to null to avoid FK constraint error
                    resolve(null);
                } else if (!row) {
                    // Parent doesn't exist in organisation table, set to null to avoid FK constraint error
                    resolve(null);
                } else {
                    // Parent exists, keep the value
                    resolve(parentOrgMrid);
                }
            }
        );
    });
};

// Helper function to normalize foreign keys in configurationEvent
const normalizeConfigurationEventFk = (event) => {
    const normalizeFk = (value) => {
        if (!value || value === '' || value === constant.ROOT) {
            return null;
        }
        return value;
    };
    
    return {
        ...event,
        power_system_resource: normalizeFk(event.power_system_resource),
        changed_location: normalizeFk(event.changed_location),
        changed_asset: normalizeFk(event.changed_asset),
        changed_organisation_role: normalizeFk(event.changed_organisation_role),
        changed_organisation: normalizeFk(event.changed_organisation),
        changed_person_role: normalizeFk(event.changed_person_role),
        changed_person: normalizeFk(event.changed_person),
        changed_attachment: normalizeFk(event.changed_attachment)
    };
};

// Helper function to check all dependencies before deleting an organisation
const checkOrganisationDependencies = async (mrid) => {
    const dependencies = {
        hasChildren: false,
        hasSubstations: false,
        hasLocations: false,
        hasPersons: false,
        childrenNames: [],
        substationNames: [],
        locationCount: 0,
        personCount: 0
    };

    try {
        const ROOT_ID = constant.ROOT;
        
        // Skip dependency check for root organisation - root should not be deleted
        if (mrid === ROOT_ID) {
            return dependencies;
        }

        // Check for children organisations
        const childrenResult = await getParentOrganizationByParentId(mrid);
        if (childrenResult.success && childrenResult.data && Array.isArray(childrenResult.data) && childrenResult.data.length > 0) {
            dependencies.hasChildren = true;
            dependencies.childrenNames = childrenResult.data.map(c => c.name || c.mrid);
        }

        // Check for substations
        const { getOrganisationPsrByOrganisationId } = await import('../organisationPsr/index.js');
        const orgPsrResult = await getOrganisationPsrByOrganisationId(mrid);
        if (orgPsrResult.success && orgPsrResult.data && Array.isArray(orgPsrResult.data) && orgPsrResult.data.length > 0) {
            for (const orgPsr of orgPsrResult.data) {
                if (orgPsr.psr_id) {
                    const substationCheck = await new Promise((resolve) => {
                        db.get("SELECT mrid, name FROM substation WHERE mrid = ?", [orgPsr.psr_id], (err, row) => {
                            if (err) resolve(null);
                            else resolve(row);
                        });
                    });
                    if (substationCheck) {
                        dependencies.hasSubstations = true;
                        dependencies.substationNames.push(substationCheck.name || substationCheck.mrid);
                    }
                }
            }
        }

        // Check for locations - only check if this is NOT root
        // Location Associations linked to root should not block deletion of child organisations
        // Query directly from database to ensure we only get Location Associations for this specific organisation (not root)
        const locationCheck = await new Promise((resolve) => {
            db.all(
                "SELECT * FROM organisation_location WHERE organisation_id = ? AND organisation_id != ?", 
                [mrid, ROOT_ID], 
                (err, rows) => {
                    if (err) {
                        resolve([]);
                    } else {
                        resolve(rows || []);
                    }
                }
            );
        });
        
        if (locationCheck.length > 0) {
            dependencies.hasLocations = true;
            dependencies.locationCount = locationCheck.length;
        }

        // Check for persons - only check if this is NOT root
        // Person Associations linked to root should not block deletion of child organisations
        // Query directly from database to ensure we only get Person Associations for this specific organisation (not root)
        const personCheck = await new Promise((resolve) => {
            db.all(
                "SELECT * FROM organisation_person WHERE organisation_id = ? AND organisation_id != ?", 
                [mrid, ROOT_ID], 
                (err, rows) => {
                    if (err) {
                        resolve([]);
                    } else {
                        resolve(rows || []);
                    }
                }
            );
        });
        
        if (personCheck.length > 0) {
            dependencies.hasPersons = true;
            dependencies.personCount = personCheck.length;
        }

    } catch (err) {
        console.error('Error checking dependencies:', err);
    }

    return dependencies;
};


// Insert OrganisationEntity
export const insertOrganisationEntity = async (entity) => {
    if(entity == null || typeof entity !== 'object') {
        return { success: false, error: new Error('Invalid entity data') };
    } else if (entity.organisation.mrid == null || entity.organisation.mrid === '') {
        return { success: false, error: new Error('Entity must have a valid MRID') };
    } else {
        const result = {
            success: false,
            error: null,
            message: '',
        };
        try {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                backupAllFilesInDir(null, null, entity.organisation.mrid);
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.organisation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.organisation.mrid);
                    result.error = syncResult.error;
                    result.message = 'Failed syncing files';
                    return result;
                }
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', (beginErr) => {
                        if (beginErr) {
                            return reject({ success: false, err: beginErr, message: 'Begin transaction failed' });
                        }
                        
                        (async () => {
                            try {
                                // Step 1: Insert streetDetail and townDetail first
                                let insertedStreetDetailMrid = null;
                                let insertedTownDetailMrid = null;
                                if (entity.streetDetail && entity.streetDetail.mrid) {
                                    const result = await insertStreetDetailTransaction(entity.streetDetail, db);
                                    if (result && result.success) insertedStreetDetailMrid = entity.streetDetail.mrid;
                                }
                                if (entity.townDetail && entity.townDetail.mrid) {
                                    const result = await insertTownDetailTransaction(entity.townDetail, db);
                                    if (result && result.success) insertedTownDetailMrid = entity.townDetail.mrid;
                                }
                                
                                // Step 2: Link streetAddress to streetDetail and townDetail before inserting
                                let insertedStreetAddressMrid = null;
                                if (entity.streetAddress && entity.streetAddress.mrid) {
                                    // Only link if records were successfully inserted
                                    entity.streetAddress.street_detail = insertedStreetDetailMrid || null;
                                    entity.streetAddress.town_detail = insertedTownDetailMrid || null;
                                    const result = await insertStreetAddressTransaction(entity.streetAddress, db);
                                    if (result && result.success) insertedStreetAddressMrid = entity.streetAddress.mrid;
                                }
                                
                                // Step 3: Insert electronicAddress and telephoneNumber
                                let insertedElectronicAddressMrid = null;
                                let insertedTelephoneNumberMrid = null;
                                if (entity.electronicAddress && entity.electronicAddress.mrid) {
                                    const result = await insertElectronicAddressTransaction(entity.electronicAddress, db);
                                    if (result && result.success) insertedElectronicAddressMrid = entity.electronicAddress.mrid;
                                }
                                if (entity.telephoneNumber && entity.telephoneNumber.mrid) {
                                    const result = await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                                    if (result && result.success) insertedTelephoneNumberMrid = entity.telephoneNumber.mrid;
                                }
                                
                                // Step 3.5: Insert person và personRole
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
                                        const ROOT_ID = constant.ROOT;
                                        
                                        // Tạo mrid nếu chưa có nhưng có department hoặc position
                                        if (!hasMrid && (hasDepartment || hasPosition)) {
                                            entity.personRole.mrid = uuid.newUuid();
                                        }
                                        // Đảm bảo personRole.person được set nếu có person.mrid
                                        if (entity.personRole.mrid && !entity.personRole.person && entity.person && entity.person.mrid) {
                                            entity.personRole.person = entity.person.mrid;
                                        }
                                        // FORCE SET personRole.organisation = entity.organisation.mrid (NOT ROOT)
                                        // Đảm bảo personRole luôn được link với đúng organisation, không phải root
                                        if (entity.personRole.mrid && entity.organisation && entity.organisation.mrid) {
                                            // Chỉ set nếu organisation.mrid không phải root
                                            if (entity.organisation.mrid !== ROOT_ID) {
                                                entity.personRole.organisation = entity.organisation.mrid;
                                            }
                                        }
                                        if (entity.personRole.mrid) {
                                            await insertPersonRoleTransaction(entity.personRole, db);
                                        }
                                    }
                                }
                                
                                
                                // Step 4: Link organisation to streetAddress, electronicAddress, and telephoneNumber before inserting
                                // Only link if records were successfully inserted, otherwise set to null
                                if (entity.organisation && entity.organisation.mrid) {
                                    // Validate and normalize all foreign keys before inserting
                                    const validateFkExists = (mrid, tableName, dbsql) => {
                                        return new Promise((resolve) => {
                                            if (!mrid) {
                                                resolve(null);
                                                return;
                                            }
                                            dbsql.get(`SELECT mrid FROM ${tableName} WHERE mrid = ?`, [mrid], (err, row) => {
                                                if (err || !row) {
                                                    resolve(null);
                                                } else {
                                                    resolve(mrid);
                                                }
                                            });
                                        });
                                    };
                                    
                                    // Validate all foreign keys exist in database
                                    entity.organisation.street_address = await validateFkExists(insertedStreetAddressMrid, 'street_address', db) || null;
                                    entity.organisation.electronic_address = await validateFkExists(insertedElectronicAddressMrid, 'electronic_address', db) || null;
                                    entity.organisation.phone = await validateFkExists(insertedTelephoneNumberMrid, 'telephone_number', db) || null;
                                    
                                    // Normalize and validate parent_organisation
                                    entity.organisation.parent_organisation = await normalizeAndValidateParentOrganisation(
                                        entity.organisation.parent_organisation, 
                                        db,
                                        entity.organisation.mrid
                                    );
                                    
                                    await insertParentOrganizationTransaction(entity.organisation, db, entity);
                                }
                                
                                // Step 4.5: Insert organisation_person AFTER organisation is inserted
                                if (entity.person && entity.person.mrid && entity.organisation && entity.organisation.mrid) {
                                    try {
                                        const { insertOrganisationPersonTransaction } = await import('../organisationPerson/index.js');
                                        const organisationPerson = {
                                            mrid: uuid.newUuid(),
                                            organisation_id: entity.organisation.mrid,
                                            person_id: entity.person.mrid
                                        };
                                        
                                        // Validate values before insert
                                        if (!organisationPerson.mrid || !organisationPerson.organisation_id || !organisationPerson.person_id) {
                                            throw new Error(`Invalid organisationPerson data: mrid=${organisationPerson.mrid}, organisation_id=${organisationPerson.organisation_id}, person_id=${organisationPerson.person_id}`);
                                        }
                                        
                                        await insertOrganisationPersonTransaction(organisationPerson, db);
                                    } catch (orgPersonErr) {
                                        // Log detailed error for debugging
                                        const errorMsg = orgPersonErr?.message || orgPersonErr?.err?.message || orgPersonErr?.toString() || 'Unknown error';
                                        console.error(`Error inserting organisationPerson:`, {
                                            error: errorMsg,
                                            organisation_id: entity.organisation?.mrid,
                                            person_id: entity.person?.mrid,
                                            fullError: orgPersonErr
                                        });
                                        throw orgPersonErr; // Re-throw to trigger rollback
                                    }
                                }
                                if (Array.isArray(entity.positionPoints) && entity.positionPoints.length > 0) await insertGeoMapArrayTransaction(entity.positionPoints, db);
                                if (entity.attachment && entity.attachment.id && entity.attachment.path) {
                                    const pathData = JSON.parse(entity.attachment.path);
                                    const newPath = []
                                    for(let i = 0; i < pathData.length; i++) {
                                        const namefile = path.basename(pathData[i].path);
                                        pathData[i].path = path.join(attachmentContext.getAttachmentPath(entity.organisation.mrid), namefile);
                                        newPath.push(pathData[i]);
                                    }
                                    entity.attachment.path = JSON.stringify(newPath);
                                    await uploadAttachmentTransaction(entity.attachment, db);
                                }
                                
                                db.run('COMMIT', async (commitErr) => {
                                    if (commitErr) {
                                        return reject({ success: false, err: commitErr, message: 'Commit transaction failed' });
                                    }
                                    
                                    // Insert configuration event AFTER commit to avoid FK constraint error
                                    if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0) {
                                        try {
                                            await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                                        } catch (configErr) {
                                            console.error('Failed to insert configuration event (non-critical):', configErr);
                                            // Don't fail the entire operation if config event fails
                                        }
                                    }
                                    
                                    resolve({ success: true, data: entity, message: 'Insert entity completed' });
                                });
                            } catch (err) {
                                db.run('ROLLBACK', () => {
                                    reject({ success: false, err, message: 'Insert entity failed: ' + (err?.message || err) });
                                });
                            }
                        })();
                    });
                })
                deleteBackupFiles(null, entity.organisation.mrid);
                result.success = true;
                result.data = entity;
                result.message = 'Insert ParentOrganisationEntity completed';
            } else {
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', (beginErr) => {
                        if (beginErr) {
                            return reject({ success: false, err: beginErr, message: 'Begin transaction failed' });
                        }
                        
                        (async () => {
                            try {
                                // Step 1: Insert streetDetail and townDetail first
                                let insertedStreetDetailMrid = null;
                                let insertedTownDetailMrid = null;
                                if (entity.streetDetail && entity.streetDetail.mrid) {
                                    const result = await insertStreetDetailTransaction(entity.streetDetail, db);
                                    if (result && result.success) insertedStreetDetailMrid = entity.streetDetail.mrid;
                                }
                                if (entity.townDetail && entity.townDetail.mrid) {
                                    const result = await insertTownDetailTransaction(entity.townDetail, db);
                                    if (result && result.success) insertedTownDetailMrid = entity.townDetail.mrid;
                                }
                                
                                // Step 2: Link streetAddress to streetDetail and townDetail before inserting
                                let insertedStreetAddressMrid = null;
                                if (entity.streetAddress && entity.streetAddress.mrid) {
                                    // Only link if records were successfully inserted
                                    entity.streetAddress.street_detail = insertedStreetDetailMrid || null;
                                    entity.streetAddress.town_detail = insertedTownDetailMrid || null;
                                    const result = await insertStreetAddressTransaction(entity.streetAddress, db);
                                    if (result && result.success) insertedStreetAddressMrid = entity.streetAddress.mrid;
                                }
                                
                                // Step 3: Insert electronicAddress and telephoneNumber
                                let insertedElectronicAddressMrid = null;
                                let insertedTelephoneNumberMrid = null;
                                if (entity.electronicAddress && entity.electronicAddress.mrid) {
                                    const result = await insertElectronicAddressTransaction(entity.electronicAddress, db);
                                    if (result && result.success) insertedElectronicAddressMrid = entity.electronicAddress.mrid;
                                }
                                if (entity.telephoneNumber && entity.telephoneNumber.mrid) {
                                    const result = await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                                    if (result && result.success) insertedTelephoneNumberMrid = entity.telephoneNumber.mrid;
                                }
                                
                                // Step 3.5: Insert person và personRole
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
                                        const ROOT_ID = constant.ROOT;
                                        
                                        // Tạo mrid nếu chưa có nhưng có department hoặc position
                                        if (!hasMrid && (hasDepartment || hasPosition)) {
                                            entity.personRole.mrid = uuid.newUuid();
                                        }
                                        // Đảm bảo personRole.person được set nếu có person.mrid
                                        if (entity.personRole.mrid && !entity.personRole.person && entity.person && entity.person.mrid) {
                                            entity.personRole.person = entity.person.mrid;
                                        }
                                        // FORCE SET personRole.organisation = entity.organisation.mrid (NOT ROOT)
                                        // Đảm bảo personRole luôn được link với đúng organisation, không phải root
                                        if (entity.personRole.mrid && entity.organisation && entity.organisation.mrid) {
                                            // Chỉ set nếu organisation.mrid không phải root
                                            if (entity.organisation.mrid !== ROOT_ID) {
                                                entity.personRole.organisation = entity.organisation.mrid;
                                            }
                                        }
                                        if (entity.personRole.mrid) {
                                            await insertPersonRoleTransaction(entity.personRole, db);
                                        }
                                    }
                                }
                                
                                
                                // Step 4: Link organisation to streetAddress, electronicAddress, and telephoneNumber before inserting
                                // Only link if records were successfully inserted, otherwise set to null
                                if (entity.organisation && entity.organisation.mrid) {
                                    // Validate and normalize all foreign keys before inserting
                                    const validateFkExists = (mrid, tableName, dbsql) => {
                                        return new Promise((resolve) => {
                                            if (!mrid) {
                                                resolve(null);
                                                return;
                                            }
                                            dbsql.get(`SELECT mrid FROM ${tableName} WHERE mrid = ?`, [mrid], (err, row) => {
                                                if (err || !row) {
                                                    resolve(null);
                                                } else {
                                                    resolve(mrid);
                                                }
                                            });
                                        });
                                    };
                                    
                                    // Validate all foreign keys exist in database
                                    entity.organisation.street_address = await validateFkExists(insertedStreetAddressMrid, 'street_address', db) || null;
                                    entity.organisation.electronic_address = await validateFkExists(insertedElectronicAddressMrid, 'electronic_address', db) || null;
                                    entity.organisation.phone = await validateFkExists(insertedTelephoneNumberMrid, 'telephone_number', db) || null;
                                    
                                    // Normalize and validate parent_organisation
                                    entity.organisation.parent_organisation = await normalizeAndValidateParentOrganisation(
                                        entity.organisation.parent_organisation, 
                                        db,
                                        entity.organisation.mrid
                                    );
                                    
                                    await insertParentOrganizationTransaction(entity.organisation, db, entity);
                                }
                                
                                // Step 4.5: Insert organisation_person AFTER organisation is inserted
                                if (entity.person && entity.person.mrid && entity.organisation && entity.organisation.mrid) {
                                    try {
                                        const { insertOrganisationPersonTransaction } = await import('../organisationPerson/index.js');
                                        const organisationPerson = {
                                            mrid: uuid.newUuid(),
                                            organisation_id: entity.organisation.mrid,
                                            person_id: entity.person.mrid
                                        };
                                        
                                        // Validate values before insert
                                        if (!organisationPerson.mrid || !organisationPerson.organisation_id || !organisationPerson.person_id) {
                                            throw new Error(`Invalid organisationPerson data: mrid=${organisationPerson.mrid}, organisation_id=${organisationPerson.organisation_id}, person_id=${organisationPerson.person_id}`);
                                        }
                                        
                                        await insertOrganisationPersonTransaction(organisationPerson, db);
                                    } catch (orgPersonErr) {
                                        // Log detailed error for debugging
                                        const errorMsg = orgPersonErr?.message || orgPersonErr?.err?.message || orgPersonErr?.toString() || 'Unknown error';
                                        console.error(`Error inserting organisationPerson:`, {
                                            error: errorMsg,
                                            organisation_id: entity.organisation?.mrid,
                                            person_id: entity.person?.mrid,
                                            fullError: orgPersonErr
                                        });
                                        throw orgPersonErr; // Re-throw to trigger rollback
                                    }
                                }
                                if (Array.isArray(entity.positionPoints) && entity.positionPoints.length > 0) await insertGeoMapArrayTransaction(entity.positionPoints, db);
                                if (entity.attachment && entity.attachment.id && entity.attachment.path) {
                                    const pathData = JSON.parse(entity.attachment.path);
                                    const newPath = []
                                    for(let i = 0; i < pathData.length; i++) {
                                        const namefile = path.basename(pathData[i].path);
                                        pathData[i].path = path.join(attachmentContext.getAttachmentPath(entity.organisation.mrid), namefile);
                                        newPath.push(pathData[i]);
                                    }
                                    entity.attachment.path = JSON.stringify(newPath);
                                    await uploadAttachmentTransaction(entity.attachment, db);
                                }
                                
                                db.run('COMMIT', async (commitErr) => {
                                    if (commitErr) {
                                        return reject({ success: false, err: commitErr, message: 'Commit transaction failed' });
                                    }
                                    
                                    // Insert configuration event AFTER commit to avoid FK constraint error
                                    // Normalize configurationEvent foreign keys before inserting
                                    if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0) {
                                        try {
                                            entity.configurationEvent = entity.configurationEvent.map(normalizeConfigurationEventFk);
                                            await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                                        } catch (configErr) {
                                            console.error('Failed to insert configuration event (non-critical):', configErr);
                                            // Don't fail the entire operation if config event fails
                                        }
                                    }
                                    
                                    resolve({ success: true, data: entity, message: 'Insert entity completed' });
                                });
                            } catch (err) {
                                db.run('ROLLBACK', () => {
                                    reject({ success: false, err, message: 'Insert entity failed: ' + (err?.message || err) });
                                });
                            }
                        })();
                    });
                })
                result.success = true;
                result.data = entity;
                result.message = 'Insert ParentOrganisationEntity completed';
            }
            return result;
        } catch (err) {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                try {
                    restoreFiles(null, null, entity.organisation.mrid);
                    deleteBackupFiles(null, entity.organisation.mrid);
                } catch (restoreErr) {
                    // Silent fail for restore
                }
            }
            
            // Extract the most detailed error message
            let errorMessage = 'Insert ParentOrganisationEntity failed and rollback executed';
            const dbError = err.err || err.error;
            
            if (dbError) {
                if (dbError.code === 'SQLITE_CONSTRAINT' && dbError.message && dbError.message.includes('FOREIGN KEY')) {
                    errorMessage = `Foreign key constraint failed: ${dbError.message}. Please ensure all referenced records (parent_organisation, electronic_address, phone, street_address) exist before inserting organisation.`;
                } else if (dbError.message) {
                    errorMessage = dbError.message;
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            result.error = errorMessage;
            result.message = errorMessage;
            
            // Insert ConfigurationEvent in a separate transaction since the main transaction was rolled back
            const configEvent = new ConfigurationEvent();
            configEvent.mrid = uuid.newUuid()
            configEvent.name = 'Change organisation'
            configEvent.effective_date_time = new Date().toISOString()
            configEvent.user_name = entity.user?.name || null
            configEvent.modified_by = entity.user?.user_id || null
            configEvent.type = "ERROR"
            configEvent.description = `Organisation changed of ${entity.organisation?.name || 'unknown'} failed`
            
            // Use insertConfigurationEvent (not Transaction version) to create a new transaction
            try {
                const { insertConfigurationEvent } = await import('../../cim/configurationEvent/index.js');
                await insertConfigurationEvent(configEvent);
            } catch (configErr) {
                // Don't fail the main operation if config event insert fails
            }
            return result;
        }
    }
}

// Get OrganisationEntity by id
export const getOrganisationEntityById = async (id) => {
    try {
        if(!id) {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const orgEntity = new OrganisationEntity();
            const dataParentOrganization = await getParentOrganizationById(id);
            if (dataParentOrganization.success) {
                orgEntity.organisation = dataParentOrganization.data
            }

            const dataStreetAddress = await getStreetAddressById(orgEntity.organisation.street_address);
            if (dataStreetAddress.success) {
                orgEntity.streetAddress = dataStreetAddress.data;
            }

            const dataStreetDetail = await getStreetDetailById(orgEntity.streetAddress.street_detail);
            if (dataStreetDetail.success) {
                orgEntity.streetDetail = dataStreetDetail.data;
            }

            const dataTownDetail = await getTownDetailById(orgEntity.streetAddress.town_detail);
            if (dataTownDetail.success) {
                orgEntity.townDetail = dataTownDetail.data;
            }

            const dataElectronicAddress = await getElectronicAddressById(orgEntity.organisation.electronic_address);
            if (dataElectronicAddress.success) {
                orgEntity.electronicAddress = dataElectronicAddress.data;
            }

            const dataTelephoneNumber = await getTelephoneNumberById(orgEntity.organisation.phone);
            if (dataTelephoneNumber.success) {
                orgEntity.telephoneNumber = dataTelephoneNumber.data;
            }

            const dataAttachment = await getAttachmentByForeignIdAndType(orgEntity.organisation.mrid, 'organisation');
            if (dataAttachment.success) {
                orgEntity.attachment = dataAttachment.data;
            }
            const dataGeoMap = await getGeoMapByOrganisationId(orgEntity.organisation.mrid);
            if (dataGeoMap.success) {
                orgEntity.positionPoints = dataGeoMap.data;
            } else {
                orgEntity.positionPoints = [];
            }

            // Load person and personRole if exists
            const dataOrganisationPerson = await getOrganisationPersonByOrganisationId(orgEntity.organisation.mrid);
            if (dataOrganisationPerson.success && dataOrganisationPerson.data && dataOrganisationPerson.data.length > 0) {
                // Get the first person (assuming one person per organisation for now)
                const organisationPerson = Array.isArray(dataOrganisationPerson.data) ? dataOrganisationPerson.data[0] : dataOrganisationPerson.data;
                if (organisationPerson && organisationPerson.person_id) {
                    const dataPerson = await getPersonById(organisationPerson.person_id);
                    if (dataPerson.success && dataPerson.data) {
                        orgEntity.person = dataPerson.data;
                        
                        // Load personRole if person has mrid
                        if (orgEntity.person.mrid) {
                            const dataPersonRole = await getPersonRoleByPersonId(orgEntity.person.mrid);
                            if (dataPersonRole.success && dataPersonRole.data) {
                                orgEntity.personRole = dataPersonRole.data;
                                
                                // FIX: Nếu personRole.organisation là root, set lại thành organisation.mrid (nếu không phải root)
                                const ROOT_ID = constant.ROOT;
                                if (orgEntity.personRole.organisation === ROOT_ID && 
                                    orgEntity.organisation && 
                                    orgEntity.organisation.mrid && 
                                    orgEntity.organisation.mrid !== ROOT_ID) {
                                    orgEntity.personRole.organisation = orgEntity.organisation.mrid;
                                }
                            }
                        }
                    }
                }
            }
            
            // If personRole doesn't exist but department/position are in top-level data, create personRole object
            // Or if personRole exists but department/position are null, update from top-level data
            // This handles the case where getParentOrganizationById returns department/position at top level
            if (dataParentOrganization.success && dataParentOrganization.data) {
                const orgData = dataParentOrganization.data;
                
                if (orgData.department !== undefined || orgData.position !== undefined) {
                    const ROOT_ID = constant.ROOT;
                    
                    if (!orgEntity.personRole) {
                        // Create personRole object if it doesn't exist
                        // FIX: Đảm bảo organisation không phải root
                        const orgMrid = (orgEntity.organisation?.mrid && orgEntity.organisation.mrid !== ROOT_ID) 
                            ? orgEntity.organisation.mrid 
                            : null;
                        
                        orgEntity.personRole = {
                            mrid: null,
                            department: orgData.department !== null && orgData.department !== undefined ? orgData.department : null,
                            position: orgData.position !== null && orgData.position !== undefined ? orgData.position : null,
                            person: orgEntity.person?.mrid || null,
                            organisation: orgMrid
                        };
                    } else {
                        // FIX: Nếu personRole.organisation là root, set lại thành organisation.mrid (nếu không phải root)
                        if (orgEntity.personRole.organisation === ROOT_ID && 
                            orgEntity.organisation && 
                            orgEntity.organisation.mrid && 
                            orgEntity.organisation.mrid !== ROOT_ID) {
                            orgEntity.personRole.organisation = orgEntity.organisation.mrid;
                        }
                        // Update department/position from top-level data if they are null/empty in personRole
                        // Always prefer top-level data if personRole values are null/undefined/empty
                        if (orgEntity.personRole.department === null || 
                            orgEntity.personRole.department === undefined || 
                            orgEntity.personRole.department === '') {
                            orgEntity.personRole.department = (orgData.department !== null && orgData.department !== undefined) 
                                ? orgData.department 
                                : null;
                        }
                        if (orgEntity.personRole.position === null || 
                            orgEntity.personRole.position === undefined || 
                            orgEntity.personRole.position === '') {
                            orgEntity.personRole.position = (orgData.position !== null && orgData.position !== undefined) 
                                ? orgData.position 
                                : null;
                        }
                    }
                }
            }

            return { success: true, data: orgEntity , message: 'Get OrganisationEntity by ID completed' };

        }
    } catch (error) {
        return { success: false, error };
    }
}

// Get OrganisationEntity list by parent id
export const getOrganisationEntityByParentId = async (parentId) => {
    try {
        if(!parentId) {
            return { success: false, error: new Error('Invalid parent ID') };
        } else {
            // Get list of organisations by parentId
            const parentOrgsResult = await getParentOrganizationByParentId(parentId);
            if (!parentOrgsResult.success || !parentOrgsResult.data || parentOrgsResult.data.length === 0) {
                return { success: true, data: [], message: 'No organisations found for parent ID' };
            }

            // Get full entity for each organisation
            const entityList = [];
            for (const org of parentOrgsResult.data) {
                const entityResult = await getOrganisationEntityById(org.mrid);
                if (entityResult.success && entityResult.data) {
                    entityList.push(entityResult.data);
                }
            }

            return { success: true, data: entityList, message: 'Get OrganisationEntity by parent ID completed' };
        }
    } catch (error) {
        return { success: false, error };
    }
}

// Helper function to check if mrid is root
const isRootOrganisation = (mrid) => {
    const ROOT_ID = constant.ROOT;
    return mrid === ROOT_ID;
};

// Delete OrganisationEntity by id
export const deleteOrganisationEntityById = async (data) => {
    if (!data || !data.organisation || !data.organisation.mrid) {
        return { success: false, error: new Error('Invalid organisation data') };
    }

    const mrid = data.organisation.mrid;
    const ROOT_ID = constant.ROOT;
    
    // ROOT ORGANISATION: Cannot be deleted - return error immediately
    if (isRootOrganisation(mrid)) {
        return {
            success: false,
            error: new Error('Cannot delete root organisation'),
            message: 'Root organisation cannot be deleted. Root organisation is a system record and must always exist.'
        };
    }

    const runSQL = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    try {
        
        // Bắt đầu transaction
        await runSQL('BEGIN TRANSACTION');

        // 2. Delete configurationEvent (since it references organisation)
        try {
            const { getConfigurationEventByChangedOrganisation } = await import('../../cim/configurationEvent/index.js');
            const configEventsResult = await getConfigurationEventByChangedOrganisation(mrid);
            if (configEventsResult.success && configEventsResult.data && Array.isArray(configEventsResult.data)) {
                const { deleteConfigurationEventByIdTransaction } = await import('../../cim/configurationEvent/index.js');
                for (const event of configEventsResult.data) {
                    if (event.mrid) {
                        await deleteConfigurationEventByIdTransaction(event.mrid, db);
                    }
                }
            }
        } catch (err) {
            console.error('Error deleting configuration events:', err);
            // Continue anyway
        }
        
        // Also delete from data if provided
        if (data.configurationEvent && Array.isArray(data.configurationEvent) && data.configurationEvent.length > 0) {
            const { deleteConfigurationEventByIdTransaction } = await import('../../cim/configurationEvent/index.js');
            for (const event of data.configurationEvent) {
                if (event.mrid) {
                    try {
                        await deleteConfigurationEventByIdTransaction(event.mrid, db);
                    } catch (err) {
                        // May already be deleted, ignore
                    }
                }
            }
        }
        
        // 3. Delete geoMap (positionPoints)
        if (data.positionPoints && Array.isArray(data.positionPoints) && data.positionPoints.length > 0) {
            const geoMapMrids = data.positionPoints.map(pt => pt.mrid).filter(m => m);
            if (geoMapMrids.length > 0) {
                await deleteGeoMapByArrayMridTransaction(geoMapMrids, db);
            }
        } else {
            // Try to get geoMap by organisationId if not in data
            const { getGeoMapByOrganisationId } = await import('../geoMap/index.js');
            const geoMapData = await getGeoMapByOrganisationId(mrid);
            if (geoMapData.success && geoMapData.data && Array.isArray(geoMapData.data) && geoMapData.data.length > 0) {
                const geoMapMrids = geoMapData.data.map(pt => pt.mrid).filter(m => m);
                if (geoMapMrids.length > 0) {
                    await deleteGeoMapByArrayMridTransaction(geoMapMrids, db);
                }
            }
        }

        // 4. Delete substations via organisation_psr
        try {
            const { getOrganisationPsrByOrganisationId } = await import('../organisationPsr/index.js');
            const orgPsrResult = await getOrganisationPsrByOrganisationId(mrid);
            if (orgPsrResult.success && orgPsrResult.data && Array.isArray(orgPsrResult.data)) {
                for (const orgPsr of orgPsrResult.data) {
                    if (orgPsr.psr_id) {
                        try {
                            // Check if it's a substation
                            const substationCheck = await new Promise((resolve) => {
                                db.get("SELECT mrid FROM substation WHERE mrid = ?", [orgPsr.psr_id], (err, row) => {
                                    if (err) resolve(null);
                                    else resolve(row);
                                });
                            });
                            
                            if (substationCheck) {
                                // It's a substation, delete it
                                try {
                                    const { deleteSubstationEntityById } = await import('../substation/index.js');
                                    await deleteSubstationEntityById(orgPsr.psr_id);
                                } catch (subErr) {
                                    console.error(`Error deleting substation ${orgPsr.psr_id}:`, subErr);
                                    // Continue - will try to delete organisation_psr anyway
                                }
                            }
                            
                            // Delete organisation_psr record (in current transaction)
                            await new Promise((resolve, reject) => {
                                db.run("DELETE FROM organisation_psr WHERE mrid = ?", [orgPsr.mrid], function (err) {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            });
                        } catch (err) {
                            console.error(`Error deleting organisation_psr ${orgPsr.mrid}:`, err);
                            throw err; // Re-throw to stop the process
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error deleting organisation_psr records:', err);
            throw err; // Re-throw to stop the process
        }

        // 5. Delete all organisation_location records for THIS REGULAR ORGANISATION ONLY (not root)
        // Query directly to ensure we only get Location Associations for this specific organisation
        try {
            const orgLocationRows = await new Promise((resolve, reject) => {
                db.all(
                    "SELECT * FROM organisation_location WHERE organisation_id = ? AND organisation_id != ?", 
                    [mrid, ROOT_ID], 
                    (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    }
                );
            });
            
            if (orgLocationRows && Array.isArray(orgLocationRows) && orgLocationRows.length > 0) {
                for (const orgLocation of orgLocationRows) {
                    await new Promise((resolve, reject) => {
                        db.run("DELETE FROM organisation_location WHERE mrid = ?", [orgLocation.mrid], function (err) {
                            if (err) {
                                console.error(`Error deleting organisation_location ${orgLocation.mrid}:`, err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            }
        } catch (err) {
            console.error('Error deleting organisation_location records:', err);
            throw err; // Re-throw to stop the process
        }

        // 6. Delete all organisation_person records for THIS REGULAR ORGANISATION ONLY (not root)
        // Query directly to ensure we only get Person Associations for this specific organisation
        try {
            const orgPersonRows = await new Promise((resolve, reject) => {
                db.all(
                    "SELECT * FROM organisation_person WHERE organisation_id = ? AND organisation_id != ?", 
                    [mrid, ROOT_ID], 
                    (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    }
                );
            });
            
            if (orgPersonRows && Array.isArray(orgPersonRows) && orgPersonRows.length > 0) {
                for (const orgPerson of orgPersonRows) {
                    if (orgPerson.person_id) {
                        // Get person details to check for electronic_address and phone
                        const { getPersonById } = await import('../../cim/person/index.js');
                        const personResult = await getPersonById(orgPerson.person_id);
                        
                        // Delete person_role for this person
                        try {
                            const { getPersonRoleByPersonId, deletePersonRoleByIdTransaction } = await import('../../cim/personRole/index.js');
                            const personRoleResult = await getPersonRoleByPersonId(orgPerson.person_id);
                            if (personRoleResult.success && personRoleResult.data && personRoleResult.data.mrid) {
                                await deletePersonRoleByIdTransaction(personRoleResult.data.mrid, db);
                            }
                        } catch (prErr) {
                            // Person role may not exist, continue
                        }
                        
                        
                        // Delete electronic_address and phone if person had them
                        if (personResult.success && personResult.data) {
                            if (personResult.data.electronic_address) {
                                try {
                                    await deleteElectronicAddressByIdTransaction(personResult.data.electronic_address, db);
                                } catch (err) {
                                    // May be shared with organisation, will delete later
                                }
                            }
                            if (personResult.data.phone) {
                                try {
                                    await deleteTelephoneNumberByIdTransaction(personResult.data.phone, db);
                                } catch (err) {
                                    // May be shared with organisation, will delete later
                                }
                            }
                        }
                    }
                    // Delete organisation_person record
                    await new Promise((resolve, reject) => {
                        db.run("DELETE FROM organisation_person WHERE mrid = ?", [orgPerson.mrid], function (err) {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
            }
        } catch (err) {
            console.error('Error deleting organisation_person records:', err);
            throw err; // Re-throw to stop the process
        }

        // 7. Delete personRole and organisationPerson from data if exists
        if (data.personRole && data.personRole.mrid) {
            try {
                await deletePersonRoleByIdTransaction(data.personRole.mrid, db);
            } catch (err) {
                // May already be deleted, ignore
            }
        }
        if (data.person && data.person.mrid) {
            // Delete person record first (releases FK on electronic_address and phone)
            try {
                const { deletePersonByIdTransaction } = await import('../../cim/person/index.js');
                await deletePersonByIdTransaction(data.person.mrid, db);
            } catch (err) {
                // May already be deleted, ignore
            }
            
            // Get organisationPerson by organisation_id and person_id
            const { getOrganisationPersonByOrganisationIdAndPersonId } = await import('../organisationPerson/index.js');
            const orgPersonData = await getOrganisationPersonByOrganisationIdAndPersonId(mrid, data.person.mrid);
            if (orgPersonData.success && orgPersonData.data && orgPersonData.data.mrid) {
                try {
                    await new Promise((resolve, reject) => {
                        db.run("DELETE FROM organisation_person WHERE mrid = ?", [orgPersonData.data.mrid], function (err) {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                } catch (err) {
                    // May already be deleted, ignore
                }
            }
        }

        // 8. Delete organisation FIRST (this will release FK constraints on address/contact records)
        // The organisation table has foreign keys to street_address, electronic_address, and phone
        // We must delete organisation first to release these constraints
        if (mrid) {
            await deleteParentOrganizationByIdTransaction(mrid, db);
        }

        // 9. Delete related address/contact records AFTER deleting organisation
        // Now that organisation is deleted, we can safely delete these records
        // Note: Some may have been deleted already when deleting person records
        if (data.streetAddress && data.streetAddress.mrid) {
            try {
                await deleteStreetAddressByIdTransaction(data.streetAddress.mrid, db);
            } catch (err) {
                // May already be deleted or not exist, ignore silently
            }
        }

        if (data.electronicAddress && data.electronicAddress.mrid) {
            try {
                await deleteElectronicAddressByIdTransaction(data.electronicAddress.mrid, db);
            } catch (err) {
                // May already be deleted (shared with person) or not exist, ignore silently
            }
        }

        if (data.telephoneNumber && data.telephoneNumber.mrid) {
            try {
                await deleteTelephoneNumberByIdTransaction(data.telephoneNumber.mrid, db);
            } catch (err) {
                // May already be deleted (shared with person) or not exist, ignore silently
            }
        }

        if (data.streetDetail && data.streetDetail.mrid) {
            try {
                await deleteStreetDetailByIdTransaction(data.streetDetail.mrid, db);
            } catch (err) {
                // May already be deleted or not exist, ignore silently
            }
        }

        if (data.townDetail && data.townDetail.mrid) {
            try {
                await deleteTownDetailByIdTransaction(data.townDetail.mrid, db);
            } catch (err) {
                // May already be deleted or not exist, ignore silently
            }
        }

        if (data.attachment && data.attachment.id) {
            try {
                await deleteAttachmentByIdTransaction(data.attachment.id, db);
            } catch (err) {
                // May already be deleted or not exist, ignore silently
            }
        }

        // Commit nếu thành công
        await runSQL('COMMIT');

        deleteDirectory(null, mrid);

        return { success: true, data, message: 'Organisation deleted successfully' };

    } catch (error) {
        try {
            await runSQL('ROLLBACK');
        } catch (rollbackErr) {
            // Rollback failed, ignore
        }
        
        // Extract detailed error message
        let errorMessage = 'Failed to delete organisation';
        const dbError = error.err || error.error || error;
        
        if (dbError) {
            if (dbError.code === 'SQLITE_CONSTRAINT' && dbError.message) {
                if (dbError.message.includes('FOREIGN KEY')) {
                    // Provide more detailed error message about what's blocking deletion
                    errorMessage = `Cannot delete organisation: It has related records that must be deleted first. This could include:\n`;
                    errorMessage += `- Child organisations (sub-organisations)\n`;
                    errorMessage += `- Linked substations or power system resources\n`;
                    errorMessage += `- Configuration events\n`;
                    errorMessage += `- Location or person associations\n`;
                    errorMessage += `\nPlease check and delete these related records before deleting this organisation.`;
                } else {
                    errorMessage = `Database constraint error: ${dbError.message}`;
                }
            } else if (dbError.message) {
                errorMessage = dbError.message;
            } else if (typeof dbError === 'string') {
                errorMessage = dbError;
            }
        }
        
        return { 
            success: false, 
            error: dbError, 
            message: errorMessage 
        };
    }
};

// Update OrganisationEntity
export const updateOrganisationEntity = async (entity) => {
    if(entity == null || typeof entity !== 'object') {
        return { success: false, error: new Error('Invalid entity data') };
    } else if (entity.organisation.mrid == null || entity.organisation.mrid === '') {
        return { success: false, error: new Error('Entity must have a valid MRID') };
    } else {
        const result = {
            success: false,
            error: null,
            message: '',
        };
        try {
            // Load existing entity to get current mrids
            const existingEntityResult = await getOrganisationEntityById(entity.organisation.mrid);
            const existingEntity = existingEntityResult.success ? existingEntityResult.data : null;

            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                backupAllFilesInDir(null, null, entity.organisation.mrid);
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.organisation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.organisation.mrid);
                    result.error = syncResult.error;
                    result.message = 'Failed syncing files';
                    return result;
                }
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', (beginErr) => {
                        if (beginErr) {
                            return reject({ success: false, err: beginErr, message: 'Begin transaction failed' });
                        }
                        
                        (async () => {
                            try {
                                // Step 1: Update or insert streetDetail and townDetail
                                let updatedStreetDetailMrid = null;
                                let updatedTownDetailMrid = null;
                                
                                // Handle streetDetail - check if there's data to save
                                if (entity.streetDetail) {
                                    const hasStreetData = entity.streetDetail.address_general && 
                                                         entity.streetDetail.address_general.trim() !== '';
                                    
                                    if (hasStreetData) {
                                        // If no mrid but has data, create new mrid
                                        if (!entity.streetDetail.mrid) {
                                            entity.streetDetail.mrid = uuid.newUuid();
                                        }
                                        
                                        if (existingEntity && existingEntity.streetDetail && existingEntity.streetDetail.mrid === entity.streetDetail.mrid) {
                                            // Update existing
                                            const updateResult = await updateStreetDetailByIdTransaction(entity.streetDetail.mrid, entity.streetDetail, db);
                                            if (updateResult && updateResult.success) updatedStreetDetailMrid = entity.streetDetail.mrid;
                                        } else {
                                            // Insert new (will use ON CONFLICT if exists)
                                            const insertResult = await insertStreetDetailTransaction(entity.streetDetail, db);
                                            if (insertResult && insertResult.success) updatedStreetDetailMrid = entity.streetDetail.mrid;
                                        }
                                    }
                                }
                                
                                // Handle townDetail - check if there's data to save
                                if (entity.townDetail) {
                                    const hasTownData = (entity.townDetail.city && entity.townDetail.city.trim() !== '') ||
                                                       (entity.townDetail.state_or_province && entity.townDetail.state_or_province.trim() !== '') ||
                                                       (entity.townDetail.country && entity.townDetail.country.trim() !== '') ||
                                                       (entity.townDetail.district_or_town && entity.townDetail.district_or_town.trim() !== '') ||
                                                       (entity.townDetail.ward_or_commune && entity.townDetail.ward_or_commune.trim() !== '');
                                    
                                    if (hasTownData) {
                                        // If no mrid but has data, create new mrid
                                        if (!entity.townDetail.mrid) {
                                            entity.townDetail.mrid = uuid.newUuid();
                                        }
                                        
                                        if (existingEntity && existingEntity.townDetail && existingEntity.townDetail.mrid === entity.townDetail.mrid) {
                                            // Update existing
                                            const updateResult = await updateTownDetailByIdTransaction(entity.townDetail.mrid, entity.townDetail, db);
                                            if (updateResult && updateResult.success) updatedTownDetailMrid = entity.townDetail.mrid;
                                        } else {
                                            // Insert new (will use ON CONFLICT if exists)
                                            const insertResult = await insertTownDetailTransaction(entity.townDetail, db);
                                            if (insertResult && insertResult.success) updatedTownDetailMrid = entity.townDetail.mrid;
                                        }
                                    }
                                }
                                
                                // Step 2: Update or insert streetAddress
                                let updatedStreetAddressMrid = null;
                                
                                // Check if we need to create/update streetAddress
                                const hasStreetDetail = updatedStreetDetailMrid || (entity.streetDetail && entity.streetDetail.mrid);
                                const hasTownDetail = updatedTownDetailMrid || (entity.townDetail && entity.townDetail.mrid);
                                
                                if (hasStreetDetail || hasTownDetail) {
                                    // Ensure streetAddress exists
                                    if (!entity.streetAddress) {
                                        entity.streetAddress = {};
                                    }
                                    
                                    // Set mrid if not exists
                                    if (!entity.streetAddress.mrid) {
                                        entity.streetAddress.mrid = uuid.newUuid();
                                    }
                                    
                                    // Update references to streetDetail and townDetail
                                    entity.streetAddress.street_detail = updatedStreetDetailMrid || (entity.streetDetail && entity.streetDetail.mrid) || entity.streetAddress.street_detail || null;
                                    entity.streetAddress.town_detail = updatedTownDetailMrid || (entity.townDetail && entity.townDetail.mrid) || entity.streetAddress.town_detail || null;
                                    
                                    if (existingEntity && existingEntity.streetAddress && existingEntity.streetAddress.mrid === entity.streetAddress.mrid) {
                                        // Update existing
                                        const updateResult = await updateStreetAddressByIdTransaction(entity.streetAddress.mrid, entity.streetAddress, db);
                                        if (updateResult && updateResult.success) updatedStreetAddressMrid = entity.streetAddress.mrid;
                                    } else {
                                        // Insert new (will use ON CONFLICT if exists)
                                        const insertResult = await insertStreetAddressTransaction(entity.streetAddress, db);
                                        if (insertResult && insertResult.success) updatedStreetAddressMrid = entity.streetAddress.mrid;
                                    }
                                } else if (entity.streetAddress && entity.streetAddress.mrid) {
                                    // If no streetDetail or townDetail, but streetAddress exists, update it to remove references
                                    entity.streetAddress.street_detail = null;
                                    entity.streetAddress.town_detail = null;
                                    
                                    if (existingEntity && existingEntity.streetAddress && existingEntity.streetAddress.mrid === entity.streetAddress.mrid) {
                                        const updateResult = await updateStreetAddressByIdTransaction(entity.streetAddress.mrid, entity.streetAddress, db);
                                        if (updateResult && updateResult.success) updatedStreetAddressMrid = entity.streetAddress.mrid;
                                    }
                                }
                                
                                // Step 3: Update or insert electronicAddress and telephoneNumber
                                let updatedElectronicAddressMrid = null;
                                let updatedTelephoneNumberMrid = null;
                                
                                if (entity.electronicAddress && entity.electronicAddress.mrid) {
                                    if (existingEntity && existingEntity.electronicAddress && existingEntity.electronicAddress.mrid === entity.electronicAddress.mrid) {
                                        const updateResult = await updateElectronicAddressByIdTransaction(entity.electronicAddress.mrid, entity.electronicAddress, db);
                                        if (updateResult && updateResult.success) updatedElectronicAddressMrid = entity.electronicAddress.mrid;
                                    } else {
                                        const insertResult = await insertElectronicAddressTransaction(entity.electronicAddress, db);
                                        if (insertResult && insertResult.success) updatedElectronicAddressMrid = entity.electronicAddress.mrid;
                                    }
                                }
                                
                                if (entity.telephoneNumber && entity.telephoneNumber.mrid) {
                                    if (existingEntity && existingEntity.telephoneNumber && existingEntity.telephoneNumber.mrid === entity.telephoneNumber.mrid) {
                                        const updateResult = await updateTelephoneNumberByIdTransaction(entity.telephoneNumber.mrid, entity.telephoneNumber, db);
                                        if (updateResult && updateResult.success) updatedTelephoneNumberMrid = entity.telephoneNumber.mrid;
                                    } else {
                                        const insertResult = await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                                        if (insertResult && insertResult.success) updatedTelephoneNumberMrid = entity.telephoneNumber.mrid;
                                    }
                                }
                                
                                // Step 3.5: Update or insert person và personRole
                                if (entity.person && (entity.person.mrid || entity.person.name)) {
                                    if (!entity.person.mrid && entity.person.name) {
                                        entity.person.mrid = uuid.newUuid();
                                    }
                                    if (entity.person.mrid) {
                                        if (existingEntity && existingEntity.person && existingEntity.person.mrid === entity.person.mrid) {
                                            await updatePersonByIdTransaction(entity.person.mrid, entity.person, db);
                                        } else {
                                            await insertPersonTransaction(entity.person, db);
                                        }
                                    }
                                }
                                
                                if (entity.personRole) {
                                    const hasDepartment = entity.personRole.department && typeof entity.personRole.department === 'string' && entity.personRole.department.trim() !== '';
                                    const hasPosition = entity.personRole.position && typeof entity.personRole.position === 'string' && entity.personRole.position.trim() !== '';
                                    const hasMrid = entity.personRole.mrid && typeof entity.personRole.mrid === 'string' && entity.personRole.mrid.trim() !== '';
                                    
                                    if (hasDepartment || hasPosition || hasMrid) {
                                        const ROOT_ID = constant.ROOT;
                                        
                                        if (!hasMrid && (hasDepartment || hasPosition)) {
                                            entity.personRole.mrid = uuid.newUuid();
                                        }
                                        if (entity.personRole.mrid && !entity.personRole.person && entity.person && entity.person.mrid) {
                                            entity.personRole.person = entity.person.mrid;
                                        }
                                        // FORCE SET personRole.organisation = entity.organisation.mrid (NOT ROOT)
                                        // Đảm bảo personRole luôn được link với đúng organisation, không phải root
                                        if (entity.personRole.mrid && entity.organisation && entity.organisation.mrid) {
                                            // Chỉ set nếu organisation.mrid không phải root
                                            if (entity.organisation.mrid !== ROOT_ID) {
                                                entity.personRole.organisation = entity.organisation.mrid;
                                            }
                                        }
                                        if (entity.personRole.mrid) {
                                            // Check if personRole exists for this person and organisation
                                            const existingPersonRoleResult = await getPersonRoleByPersonId(entity.personRole.person);
                                            const existingPersonRole = existingPersonRoleResult.success && existingPersonRoleResult.data && 
                                                                      existingPersonRoleResult.data.organisation === entity.organisation.mrid ? existingPersonRoleResult.data : null;
                                            
                                            if (existingPersonRole && existingPersonRole.mrid === entity.personRole.mrid) {
                                                await updatePersonRoleTransaction(entity.personRole.mrid, entity.personRole, db);
                                            } else {
                                                await insertPersonRoleTransaction(entity.personRole, db);
                                            }
                                        }
                                    }
                                }
                                
                                // Step 4: Update organisation
                                if (entity.organisation && entity.organisation.mrid) {
                                    // Merge với dữ liệu hiện tại để đảm bảo không mất dữ liệu
                                    if (existingEntity && existingEntity.organisation) {
                                        // Giữ lại các trường từ existingEntity nếu không có trong entity mới hoặc là null/undefined/empty string
                                        // Chỉ update nếu giá trị mới thực sự có (không phải null, undefined, hoặc empty string)
                                        // Empty string được coi là không có giá trị (form không gửi hoặc người dùng không nhập)
                                        if (!entity.organisation.name || entity.organisation.name === '') {
                                            entity.organisation.name = existingEntity.organisation.name;
                                        }
                                        if (entity.organisation.description === undefined || entity.organisation.description === null || entity.organisation.description === '') {
                                            entity.organisation.description = existingEntity.organisation.description;
                                        }
                                        if (entity.organisation.alias_name === undefined || entity.organisation.alias_name === null || entity.organisation.alias_name === '') {
                                            entity.organisation.alias_name = existingEntity.organisation.alias_name;
                                        }
                                        if (entity.organisation.tax_code === undefined || entity.organisation.tax_code === null || entity.organisation.tax_code === '') {
                                            entity.organisation.tax_code = existingEntity.organisation.tax_code;
                                        }
                                    }
                                    
                                    const validateFkExists = (mrid, tableName, dbsql) => {
                                        return new Promise((resolve) => {
                                            if (!mrid) {
                                                resolve(null);
                                                return;
                                            }
                                            dbsql.get(`SELECT mrid FROM ${tableName} WHERE mrid = ?`, [mrid], (err, row) => {
                                                if (err || !row) {
                                                    resolve(null);
                                                } else {
                                                    resolve(mrid);
                                                }
                                            });
                                        });
                                    };
                                    
                                    entity.organisation.street_address = await validateFkExists(updatedStreetAddressMrid, 'street_address', db) || entity.organisation.street_address || null;
                                    entity.organisation.electronic_address = await validateFkExists(updatedElectronicAddressMrid, 'electronic_address', db) || entity.organisation.electronic_address || null;
                                    entity.organisation.phone = await validateFkExists(updatedTelephoneNumberMrid, 'telephone_number', db) || entity.organisation.phone || null;
                                    
                                    entity.organisation.parent_organisation = await normalizeAndValidateParentOrganisation(
                                        entity.organisation.parent_organisation, 
                                        db,
                                        entity.organisation.mrid
                                    );
                                    await updateParentOrganizationTransaction(entity.organisation.mrid, entity.organisation, db);
                                }
                                
                                // Step 5: Update geoMap - update existing ones, insert new ones, delete removed ones
                                if (Array.isArray(entity.positionPoints) && entity.positionPoints.length > 0) {
                                    // Separate existing (with mrid) and new (without mrid) position points
                                    const existingPoints = entity.positionPoints.filter(p => p.mrid && p.mrid !== '');
                                    const newPoints = entity.positionPoints.filter(p => !p.mrid || p.mrid === '');
                                    
                                    // Update existing position points
                                    if (existingPoints.length > 0) {
                                        await updateGeoMapArrayByIdTransaction(existingPoints, db);
                                    }
                                    
                                    // Insert new position points
                                    if (newPoints.length > 0) {
                                        await insertGeoMapArrayTransaction(newPoints, db);
                                    }
                                    
                                    // Delete position points that are no longer in the list
                                    if (existingEntity && existingEntity.positionPoints && Array.isArray(existingEntity.positionPoints) && existingEntity.positionPoints.length > 0) {
                                        const newMrids = existingPoints.map(p => p.mrid).filter(m => m);
                                        const oldMrids = existingEntity.positionPoints.map(p => p.mrid).filter(m => m);
                                        const mridsToDelete = oldMrids.filter(mrid => !newMrids.includes(mrid));
                                        
                                        if (mridsToDelete.length > 0) {
                                            await deleteGeoMapByArrayMridTransaction(mridsToDelete, db);
                                        }
                                    }
                                } else {
                                    // If no position points in new data, delete all existing ones
                                    if (existingEntity && existingEntity.positionPoints && Array.isArray(existingEntity.positionPoints) && existingEntity.positionPoints.length > 0) {
                                        const oldMrids = existingEntity.positionPoints.map(p => p.mrid).filter(m => m);
                                        if (oldMrids.length > 0) {
                                            await deleteGeoMapByArrayMridTransaction(oldMrids, db);
                                        }
                                    }
                                }
                                
                                // Step 6: Update attachment
                                if (entity.attachment && entity.attachment.id && entity.attachment.path) {
                                    const pathData = JSON.parse(entity.attachment.path);
                                    const newPath = []
                                    for(let i = 0; i < pathData.length; i++) {
                                        const namefile = path.basename(pathData[i].path);
                                        pathData[i].path = path.join(attachmentContext.getAttachmentPath(entity.organisation.mrid), namefile);
                                        newPath.push(pathData[i]);
                                    }
                                    entity.attachment.path = JSON.stringify(newPath);
                                    await uploadAttachmentTransaction(entity.attachment, db);
                                }
                                
                                // Step 7: Insert configuration event
                                if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0) {
                                    entity.configurationEvent = entity.configurationEvent.map(normalizeConfigurationEventFk);
                                    await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                                }
                                
                                db.run('COMMIT', (commitErr) => {
                                    if (commitErr) {
                                        return reject({ success: false, err: commitErr, message: 'Commit transaction failed' });
                                    }
                                    resolve({ success: true, data: entity, message: 'Update entity completed' });
                                });
                            } catch (err) {
                                db.run('ROLLBACK', () => {
                                    reject({ success: false, err, message: 'Update entity failed: ' + (err?.message || err) });
                                });
                            }
                        })();
                    });
                })
                deleteBackupFiles(null, entity.organisation.mrid);
                result.success = true;
                result.data = entity;
                result.message = 'Update ParentOrganisationEntity completed';
            } else {
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', (beginErr) => {
                        if (beginErr) {
                            return reject({ success: false, err: beginErr, message: 'Begin transaction failed' });
                        }
                        
                        (async () => {
                            try {
                                // Same logic as above but without file sync
                                let updatedStreetDetailMrid = null;
                                let updatedTownDetailMrid = null;
                                
                                if (entity.streetDetail && entity.streetDetail.mrid) {
                                    if (existingEntity && existingEntity.streetDetail && existingEntity.streetDetail.mrid === entity.streetDetail.mrid) {
                                        const updateResult = await updateStreetDetailByIdTransaction(entity.streetDetail.mrid, entity.streetDetail, db);
                                        if (updateResult && updateResult.success) updatedStreetDetailMrid = entity.streetDetail.mrid;
                                    } else {
                                        const insertResult = await insertStreetDetailTransaction(entity.streetDetail, db);
                                        if (insertResult && insertResult.success) updatedStreetDetailMrid = entity.streetDetail.mrid;
                                    }
                                }
                                
                                if (entity.townDetail && entity.townDetail.mrid) {
                                    if (existingEntity && existingEntity.townDetail && existingEntity.townDetail.mrid === entity.townDetail.mrid) {
                                        const updateResult = await updateTownDetailByIdTransaction(entity.townDetail.mrid, entity.townDetail, db);
                                        if (updateResult && updateResult.success) updatedTownDetailMrid = entity.townDetail.mrid;
                                    } else {
                                        const insertResult = await insertTownDetailTransaction(entity.townDetail, db);
                                        if (insertResult && insertResult.success) updatedTownDetailMrid = entity.townDetail.mrid;
                                    }
                                }
                                
                                let updatedStreetAddressMrid = null;
                                if (entity.streetAddress && entity.streetAddress.mrid) {
                                    entity.streetAddress.street_detail = updatedStreetDetailMrid || entity.streetAddress.street_detail || null;
                                    entity.streetAddress.town_detail = updatedTownDetailMrid || entity.streetAddress.town_detail || null;
                                    
                                    if (existingEntity && existingEntity.streetAddress && existingEntity.streetAddress.mrid === entity.streetAddress.mrid) {
                                        const updateResult = await updateStreetAddressByIdTransaction(entity.streetAddress.mrid, entity.streetAddress, db);
                                        if (updateResult && updateResult.success) updatedStreetAddressMrid = entity.streetAddress.mrid;
                                    } else {
                                        const insertResult = await insertStreetAddressTransaction(entity.streetAddress, db);
                                        if (insertResult && insertResult.success) updatedStreetAddressMrid = entity.streetAddress.mrid;
                                    }
                                }
                                
                                let updatedElectronicAddressMrid = null;
                                let updatedTelephoneNumberMrid = null;
                                
                                if (entity.electronicAddress && entity.electronicAddress.mrid) {
                                    if (existingEntity && existingEntity.electronicAddress && existingEntity.electronicAddress.mrid === entity.electronicAddress.mrid) {
                                        const updateResult = await updateElectronicAddressByIdTransaction(entity.electronicAddress.mrid, entity.electronicAddress, db);
                                        if (updateResult && updateResult.success) updatedElectronicAddressMrid = entity.electronicAddress.mrid;
                                    } else {
                                        const insertResult = await insertElectronicAddressTransaction(entity.electronicAddress, db);
                                        if (insertResult && insertResult.success) updatedElectronicAddressMrid = entity.electronicAddress.mrid;
                                    }
                                }
                                
                                if (entity.telephoneNumber && entity.telephoneNumber.mrid) {
                                    if (existingEntity && existingEntity.telephoneNumber && existingEntity.telephoneNumber.mrid === entity.telephoneNumber.mrid) {
                                        const updateResult = await updateTelephoneNumberByIdTransaction(entity.telephoneNumber.mrid, entity.telephoneNumber, db);
                                        if (updateResult && updateResult.success) updatedTelephoneNumberMrid = entity.telephoneNumber.mrid;
                                    } else {
                                        const insertResult = await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                                        if (insertResult && insertResult.success) updatedTelephoneNumberMrid = entity.telephoneNumber.mrid;
                                    }
                                }
                                
                                if (entity.person && (entity.person.mrid || entity.person.name)) {
                                    if (!entity.person.mrid && entity.person.name) {
                                        entity.person.mrid = uuid.newUuid();
                                    }
                                    if (entity.person.mrid) {
                                        if (existingEntity && existingEntity.person && existingEntity.person.mrid === entity.person.mrid) {
                                            await updatePersonByIdTransaction(entity.person.mrid, entity.person, db);
                                        } else {
                                            await insertPersonTransaction(entity.person, db);
                                        }
                                    }
                                }
                                
                                if (entity.personRole) {
                                    const hasDepartment = entity.personRole.department && typeof entity.personRole.department === 'string' && entity.personRole.department.trim() !== '';
                                    const hasPosition = entity.personRole.position && typeof entity.personRole.position === 'string' && entity.personRole.position.trim() !== '';
                                    const hasMrid = entity.personRole.mrid && typeof entity.personRole.mrid === 'string' && entity.personRole.mrid.trim() !== '';
                                    
                                    if (hasDepartment || hasPosition || hasMrid) {
                                        const ROOT_ID = constant.ROOT;
                                        
                                        if (!hasMrid && (hasDepartment || hasPosition)) {
                                            entity.personRole.mrid = uuid.newUuid();
                                        }
                                        if (entity.personRole.mrid && !entity.personRole.person && entity.person && entity.person.mrid) {
                                            entity.personRole.person = entity.person.mrid;
                                        }
                                        // FORCE SET personRole.organisation = entity.organisation.mrid (NOT ROOT)
                                        // Đảm bảo personRole luôn được link với đúng organisation, không phải root
                                        if (entity.personRole.mrid && entity.organisation && entity.organisation.mrid) {
                                            // Chỉ set nếu organisation.mrid không phải root
                                            if (entity.organisation.mrid !== ROOT_ID) {
                                                entity.personRole.organisation = entity.organisation.mrid;
                                            }
                                        }
                                        if (entity.personRole.mrid) {
                                            const existingPersonRoleResult = await getPersonRoleByPersonId(entity.personRole.person);
                                            const existingPersonRole = existingPersonRoleResult.success && existingPersonRoleResult.data && 
                                                                      existingPersonRoleResult.data.organisation === entity.organisation.mrid ? existingPersonRoleResult.data : null;
                                            
                                            if (existingPersonRole && existingPersonRole.mrid === entity.personRole.mrid) {
                                                await updatePersonRoleTransaction(entity.personRole.mrid, entity.personRole, db);
                                            } else {
                                                await insertPersonRoleTransaction(entity.personRole, db);
                                            }
                                        }
                                    }
                                }
                                
                                if (entity.organisation && entity.organisation.mrid) {
                                    const validateFkExists = (mrid, tableName, dbsql) => {
                                        return new Promise((resolve) => {
                                            if (!mrid) {
                                                resolve(null);
                                                return;
                                            }
                                            dbsql.get(`SELECT mrid FROM ${tableName} WHERE mrid = ?`, [mrid], (err, row) => {
                                                if (err || !row) {
                                                    resolve(null);
                                                } else {
                                                    resolve(mrid);
                                                }
                                            });
                                        });
                                    };
                                    
                                    entity.organisation.street_address = await validateFkExists(updatedStreetAddressMrid, 'street_address', db) || entity.organisation.street_address || null;
                                    entity.organisation.electronic_address = await validateFkExists(updatedElectronicAddressMrid, 'electronic_address', db) || entity.organisation.electronic_address || null;
                                    entity.organisation.phone = await validateFkExists(updatedTelephoneNumberMrid, 'telephone_number', db) || entity.organisation.phone || null;
                                    
                                    entity.organisation.parent_organisation = await normalizeAndValidateParentOrganisation(
                                        entity.organisation.parent_organisation, 
                                        db,
                                        entity.organisation.mrid
                                    );
                                    
                                    await updateParentOrganizationTransaction(entity.organisation.mrid, entity.organisation, db);
                                }
                                
                                // Step 5: Update geoMap - update existing ones, insert new ones, delete removed ones
                                if (Array.isArray(entity.positionPoints) && entity.positionPoints.length > 0) {
                                    // Separate existing (with mrid) and new (without mrid) position points
                                    const existingPoints = entity.positionPoints.filter(p => p.mrid && p.mrid !== '');
                                    const newPoints = entity.positionPoints.filter(p => !p.mrid || p.mrid === '');
                                    
                                    // Update existing position points
                                    if (existingPoints.length > 0) {
                                        await updateGeoMapArrayByIdTransaction(existingPoints, db);
                                    }
                                    
                                    // Insert new position points
                                    if (newPoints.length > 0) {
                                        await insertGeoMapArrayTransaction(newPoints, db);
                                    }
                                    
                                    // Delete position points that are no longer in the list
                                    if (existingEntity && existingEntity.positionPoints && Array.isArray(existingEntity.positionPoints) && existingEntity.positionPoints.length > 0) {
                                        const newMrids = existingPoints.map(p => p.mrid).filter(m => m);
                                        const oldMrids = existingEntity.positionPoints.map(p => p.mrid).filter(m => m);
                                        const mridsToDelete = oldMrids.filter(mrid => !newMrids.includes(mrid));
                                        
                                        if (mridsToDelete.length > 0) {
                                            await deleteGeoMapByArrayMridTransaction(mridsToDelete, db);
                                        }
                                    }
                                } else {
                                    // If no position points in new data, delete all existing ones
                                    if (existingEntity && existingEntity.positionPoints && Array.isArray(existingEntity.positionPoints) && existingEntity.positionPoints.length > 0) {
                                        const oldMrids = existingEntity.positionPoints.map(p => p.mrid).filter(m => m);
                                        if (oldMrids.length > 0) {
                                            await deleteGeoMapByArrayMridTransaction(oldMrids, db);
                                        }
                                    }
                                }
                                
                                if (entity.attachment && entity.attachment.id && entity.attachment.path) {
                                    const pathData = JSON.parse(entity.attachment.path);
                                    const newPath = []
                                    for(let i = 0; i < pathData.length; i++) {
                                        const namefile = path.basename(pathData[i].path);
                                        pathData[i].path = path.join(attachmentContext.getAttachmentPath(entity.organisation.mrid), namefile);
                                        newPath.push(pathData[i]);
                                    }
                                    entity.attachment.path = JSON.stringify(newPath);
                                    await uploadAttachmentTransaction(entity.attachment, db);
                                }
                                
                                if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0) {
                                    entity.configurationEvent = entity.configurationEvent.map(normalizeConfigurationEventFk);
                                    await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                                }
                                
                                db.run('COMMIT', (commitErr) => {
                                    if (commitErr) {
                                        return reject({ success: false, err: commitErr, message: 'Commit transaction failed' });
                                    }
                                    resolve({ success: true, data: entity, message: 'Update entity completed' });
                                });
                            } catch (err) {
                                db.run('ROLLBACK', () => {
                                    reject({ success: false, err, message: 'Update entity failed: ' + (err?.message || err) });
                                });
                            }
                        })();
                    });
                })
                result.success = true;
                result.data = entity;
                result.message = 'Update ParentOrganisationEntity completed';
            }
            return result;
        } catch (err) {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                try {
                    restoreFiles(null, null, entity.organisation.mrid);
                    deleteBackupFiles(null, entity.organisation.mrid);
                } catch (restoreErr) {
                    // Silent fail for restore
                }
            }
            
            let errorMessage = 'Update ParentOrganisationEntity failed and rollback executed';
            const dbError = err.err || err.error;
            
            if (dbError) {
                if (dbError.code === 'SQLITE_CONSTRAINT' && dbError.message && dbError.message.includes('FOREIGN KEY')) {
                    errorMessage = `Foreign key constraint failed: ${dbError.message}. Please ensure all referenced records exist.`;
                } else if (dbError.message) {
                    errorMessage = dbError.message;
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            result.error = errorMessage;
            result.message = errorMessage;
            return result;
        }
    }
}
