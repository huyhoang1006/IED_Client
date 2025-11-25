import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Lấy work theo mrid
export const getWorkById = async (mrid) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM work WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get work by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Work not found' })
                    return resolve({ success: true, data: row, message: 'Get work by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get work by id failed' }
    }
}

// Thêm mới work trong transaction
export const insertWorkTransaction = async (work, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Insert identified_object trước
            if (work.mrid) {
                const identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction({
                    mrid: work.mrid,
                    name: work.name || null,
                    alias_name: work.alias_name || null,
                    description: work.description || null
                }, dbsql)
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
            }
            
            dbsql.run(
                `INSERT INTO work(mrid) VALUES (?)
                 ON CONFLICT(mrid) DO NOTHING`,
                [work.mrid],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert work failed' })
                    return resolve({ success: true, data: work, message: 'Insert work completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert work failed' })
        }
    })
}

// Cập nhật work trong transaction
export const updateWorkByIdTransaction = async (mrid, work, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Update identified_object
            if (mrid) {
                const identifiedResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, work, dbsql)
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
            }
            
            return resolve({ success: true, data: work, message: 'Update work completed' })
        } catch (err) {
            return reject({ success: false, err, message: 'Update work failed' })
        }
    })
}

// Xóa work trong transaction
export const deleteWorkByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM work WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete work failed' })
                // Delete identified_object
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                    .then(() => resolve({ success: true, data: null, message: 'Delete work completed' }))
                    .catch(() => resolve({ success: true, data: null, message: 'Delete work completed (identified_object may not exist)' }))
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete work failed' })
        }
    })
}

