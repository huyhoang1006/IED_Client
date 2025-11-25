'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "../../../function/index.js"

export const insertSubstationEntity = () => {
    ipcMain.handle('insertSubstationEntity', async function (event, entity) {
        try {
            const rs = await entityFunc.substationEntityFunc.insertSubstationEntity(entity)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                console.error('Insert substation entity failed:', rs.message, rs.error)
                const errorMessage = rs.message || "Insert substation entity failed"
                const errorDetails = rs.error ? (typeof rs.error === 'string' ? rs.error : JSON.stringify(rs.error)) : undefined
                return {
                    success: false,
                    message: errorMessage,
                    error: errorDetails || rs.err ? (typeof rs.err === 'string' ? rs.err : JSON.stringify(rs.err)) : undefined
                }
            }
        } catch (error) {
            console.error('Insert substation entity error:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: error.stack || JSON.stringify(error, null, 2)
            }
        }
    })
}

export const getSubstationEntityByMrid = () => {
    ipcMain.handle('getSubstationEntityByMrid', async function (event, mrid, user_id, organisation_id) {
        try {
            const rs = await entityFunc.substationEntityFunc.getSubstationEntityById(mrid, user_id, organisation_id)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "Get substation entity failed",
                }
            }
        } catch (error) {
            console.error('Get substation entity error:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// export const updateSubstationEntityByMrid = () => {
//     ipcMain.handle('updateSubstationEntityByMrid', async function (event, mrid, entity) {
//         try {
//             const rs = await entityFunc.substationEntityFunc.updateSubstationEntityByMrid(mrid, entity)
//             if (rs.success === true) {
//                 return {
//                     success: true,
//                     message: "Success",
//                     data: rs.data
//                 }
//             } else {
//                 return {
//                     success: false,
//                     message: rs.message || "Update substation entity failed",
//                 }
//             }
//         } catch (error) {
//             console.error('Update substation entity error:', error)
//             return {
//                 success: false,
//                 message: (error && error.message) ? error.message : "Internal error",
//             }
//         }
//     })
// }

export const deleteSubstationEntityByMrid = () => {
    ipcMain.handle('deleteSubstationEntityByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.substationEntityFunc.deleteSubstationEntityById(data)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                console.error('Delete substation entity failed:', rs.message, rs.error)
                return {
                    success: false,
                    message: rs.message || "Delete substation entity failed",
                    error: rs.error ? (rs.error.message || rs.error) : undefined
                }
            }
        } catch (error) {
            console.error('Delete substation entity error:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: error
            }
        }
    })
}

export const active = () => {
    insertSubstationEntity()
    getSubstationEntityByMrid()
    // updateSubstationEntityByMrid()
    deleteSubstationEntityByMrid()
}
