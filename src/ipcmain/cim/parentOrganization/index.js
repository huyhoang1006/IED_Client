'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "../../../function/index.js"
import {createOrganisationRoot} from "../../../update/organisationRoot/index.js"

const ROOT_ID = '00000000-0000-0000-0000-000000000000'

export const getParentOrganizationByMrid = () => {
    ipcMain.handle('getParentOrganizationByMrid', async function (event, mrid) {
        try {
            let rs = await cimFunc.parentOrganizationFunc.getParentOrganizationById(mrid)
            
            // Nếu không tìm thấy và đây là ROOT, tự động tạo root owner
            if (!rs.success && mrid === ROOT_ID) {
                try {
                    const createResult = await createOrganisationRoot()
                    if (createResult && createResult.success) {
                        // Đợi một chút để đảm bảo transaction commit hoàn thành
                        await new Promise(resolve => setTimeout(resolve, 100))
                        // Retry sau khi tạo
                        rs = await cimFunc.parentOrganizationFunc.getParentOrganizationById(mrid)
                    } else {
                        const errorMsg = createResult?.message || createResult?.err?.message || 'Unknown error'
                        // Nếu lỗi do bảng không tồn tại, trả về message rõ ràng
                        if (errorMsg.includes('no such table') || errorMsg.includes('table owner')) {
                            return {
                                success: false,
                                message: 'Owner table does not exist. Please run database migration first.',
                                error: createResult?.err || null
                            }
                        }
                    }
                } catch (createError) {
                    const errorMsg = createError?.message || createError?.toString() || 'Unknown error'
                    if (errorMsg.includes('no such table') || errorMsg.includes('table owner')) {
                        return {
                            success: false,
                            message: 'Owner table does not exist. Please run database migration first.',
                            error: createError
                        }
                    }
                }
            }
            
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: {
                        ...rs.data,
                        mode: 'organisation'
                    }
                }
            } else {
                return {
                    success: false,
                    message: rs.message || `Organization with mrid '${mrid}' not found`,
                    error: rs.err || null
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

export const getParentOrganizationByParentMrid = () => {
    ipcMain.handle('getParentOrganizationByParentMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.getParentOrganizationByParentId(mrid)
            if (rs.success === true) {
                const mappedData = rs.data.map(item => ({
                    ...item,
                    mode: 'organisation'
                }));
                return {
                    success: true,
                    message: "Success",
                    data: mappedData
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const insertParentOrganization = () => {
    ipcMain.handle('insertParentOrganization', async function (event, data) {
        const rs = await cimFunc.parentOrganizationFunc.insertParentOrganisation(data)
        try {
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: { ...rs.data }
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateParentOrganizationByMrid = () => {
    ipcMain.handle('updateParentOrganizationByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.updateParentOrganizationById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteParentOrganizationByMrid = () => {
    ipcMain.handle('deleteParentOrganizationByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.parentOrganizationFunc.deleteParentOrganizationById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    getParentOrganizationByMrid()
    getParentOrganizationByParentMrid()
    insertParentOrganization()
    updateParentOrganizationByMrid()
    deleteParentOrganizationByMrid()
}