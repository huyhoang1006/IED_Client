'use strict'
import {ipcMain} from 'electron'
import {cimFunc, entityFunc} from "../../../function/index.js"

export const insertParentOrganizationEntity = () => {
    ipcMain.removeHandler('insertParentOrganizationEntity')
    ipcMain.handle('insertParentOrganizationEntity', async function (event, data) {
        try {
            const rs = await entityFunc.parentOrganizationEntityFunc.insertOrganisationEntity(data);
            
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            }
            else {
                const response = {
                    success: false,
                    message: rs.message || "fail"
                }
                if (rs.error) {
                    response.error = rs.error
                }
                return response
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: error
            }
        }
    })
}

export const getOrganisationEntityByMrid = () => {
    ipcMain.removeHandler('getOrganisationEntityByMrid')
    ipcMain.handle('getOrganisationEntityByMrid', async function (event, id) {
        try {
            if (!id) {
                return {
                    success: false,
                    message: "Invalid ID provided",
                    error: new Error('ID is required')
                }
            }
            const rs = await entityFunc.parentOrganizationEntityFunc.getOrganisationEntityById(id)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                const response = {
                    success: false,
                    message: rs.message || "fail"
                }
                if (rs.error) {
                    response.error = rs.error
                }
                return response
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: error
            }
        }
    })
}

// export const getParentOrganizationByParentMrid = () => {
//     ipcMain.removeHandler('getParentOrganizationByParentMrid')
//     ipcMain.handle('getParentOrganizationByParentMrid', async function (event, mrid) {
//         try {
//             const rs = await entityFunc.parentOrganizationEntityFunc.getOrganisationEntityByParentId(mrid)
//             if (rs.success === true) {
//                 // Map OrganisationEntity objects to flat structure for tree navigation
//                 // OrganisationEntity has nested structure: { organisation: { mrid, name, ... }, streetAddress: {...}, ... }
//                 // Tree navigation needs: { mrid, name, ... } at top level
//                 const mappedData = rs.data.map(item => {
//                     // Extract basic info from organisation object
//                     const org = item.organisation || {};
//                     return {
//                         // Top-level properties for tree navigation
//                         mrid: org.mrid || item.mrid,
//                         id: org.mrid || item.mrid || item.id,
//                         name: org.name || item.name || '',
//                         tax_code: org.tax_code || item.tax_code || '',
//                         parent_organisation: org.parent_organisation || item.parent_organisation || null,
//                         // Keep full entity structure for detailed view
//                         ...item,
//                         mode: 'organisation'
//                     };
//                 });
//                 return {
//                     success: true,
//                     message: "Success",
//                     data: mappedData
//                 }
//             }
//             else {
//                 return {
//                     success: false,
//                     message: rs.message || "fail",
//                 }
//             }
//         } catch (error) {
//             console.log(error)
//             return {
//                 success: false,
//                 message: (error && error.message) ? error.message : "Internal error",
//             }
//         }
//     })
// }

export const deleteParentOrganizationEntity = () => {
    ipcMain.removeHandler('deleteParentOrganizationEntity')
    ipcMain.handle('deleteParentOrganizationEntity', async function (event, data) {
        try {
            // Extract mrid from data - data can be mrid string or object with mrid
            let mrid = null;
            if (typeof data === 'string') {
                mrid = data;
            } else if (data && typeof data === 'object') {
                // Try multiple ways to extract mrid
                mrid = data.mrid || 
                       data.id || 
                       (data.organisation && (data.organisation.mrid || data.organisation.id)) ||
                       (data.organisationId) ||
                       null;
                
                // If still no mrid, try to get from node structure (for tree navigation)
                if (!mrid && data.node) {
                    mrid = data.node.mrid || data.node.id;
                }
            }
            
            // Additional check: if data is entity object but mrid extraction failed, try to get from organisation
            if (!mrid && data && typeof data === 'object' && data.organisation) {
                mrid = data.organisation.mrid || data.organisation.id;
            }
            
            if (!mrid || mrid === '') {
                return {
                    success: false,
                    message: "mrid is required for deletion"
                }
            }
            
            // If data is already a full entity with organisation object, use it; otherwise try to load or create minimal entity
            let entityData = data;
            if (typeof data === 'string' || (data && !data.organisation)) {
                const ROOT_ID = '00000000-0000-0000-0000-000000000000';
                if (mrid === ROOT_ID) {
                    entityData = {
                        organisation: {
                            mrid: mrid,
                            name: 'Root'
                        }
                    };
                } else {
                    // Try to load full entity first to get all related data
                    const loadResult = await entityFunc.parentOrganizationEntityFunc.getOrganisationEntityById(mrid);
                    if (loadResult.success && loadResult.data && loadResult.data.organisation && loadResult.data.organisation.mrid) {
                        // Successfully loaded full entity
                        entityData = loadResult.data;
                    } else {
                        // If cannot load full entity, create minimal entity with just mrid for deletion
                        // This allows deletion even if entity structure is incomplete or entity not found in some tables
                        entityData = {
                            organisation: {
                                mrid: mrid
                            }
                        };
                    }
                }
            } else if (data.organisation) {
                // Data has organisation object, but might have 'id' instead of 'mrid'
                // Ensure mrid is set correctly
                if (!entityData.organisation.mrid && mrid) {
                    entityData.organisation.mrid = mrid;
                }
                // Remove 'id' if it exists and is different from mrid to avoid confusion
                if (entityData.organisation.id && entityData.organisation.id !== entityData.organisation.mrid) {
                    delete entityData.organisation.id;
                }
            }
            
            // Ensure entityData has organisation with mrid
            if (!entityData.organisation) {
                entityData.organisation = {};
            }
            if (!entityData.organisation.mrid && mrid) {
                entityData.organisation.mrid = mrid;
            }
            
            if (!entityData.organisation.mrid) {
                return {
                    success: false,
                    message: "Invalid entity data: organisation mrid is required"
                }
            }
            
            const rs = await entityFunc.parentOrganizationEntityFunc.deleteOrganisationEntityById(entityData);
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data || {}
                }
            }
            else {
                const response = {
                    success: false,
                    message: rs.message || "fail"
                }
                if (rs.error) {
                    response.error = rs.error
                }
                return response
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: error
            }
        }
    })
}

export const updateParentOrganizationEntity = () => {
    ipcMain.removeHandler('updateParentOrganizationEntity')
    ipcMain.handle('updateParentOrganizationEntity', async function (event, data) {
        try {
            const rs = await entityFunc.parentOrganizationEntityFunc.updateOrganisationEntity(data);
            
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || "fail",
                    error: rs.error || undefined
                }
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: error
            }
        }
    })
}

export const active = () => {
    insertParentOrganizationEntity()
    getOrganisationEntityByMrid()
    // getParentOrganizationByParentMrid()
    deleteParentOrganizationEntity()
    updateParentOrganizationEntity()
}