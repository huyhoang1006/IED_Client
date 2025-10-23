import db from '../../../../electron/db.js'
import * as organisationFunc from './organisation/index.js'

// Thêm mới Parent Organisation
export const insertParentOrganisation = (parentOrganization) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            // Disable foreign key checks ngay từ đầu
            db.run('PRAGMA foreign_keys = OFF')
            db.run('BEGIN TRANSACTION')
            try {
                const orgResult = await organisationFunc.insertOrganisationTransaction(parentOrganization, db)

                if (!orgResult.success) {
                    db.run('ROLLBACK')
                    return reject({success: false, err: orgResult.err, message: 'Insert organisation failed: ' + orgResult.message})
                }

                db.run(`INSERT INTO parent_organization(mrid) VALUES (?) ON CONFLICT(mrid) DO NOTHING`, [parentOrganization.mrid], function (err) {
                    if (err) {
                        console.error('Error inserting into parent_organization:', err)
                        db.run('ROLLBACK')
                        return reject({success: false, err, message: 'Insert into parent_organization failed'})
                    }
                    db.run('COMMIT')
                    // Re-enable foreign key checks
                    db.run('PRAGMA foreign_keys = ON')
                    return resolve({success: true, data: parentOrganization, message: 'Insert organisation completed'})
                })
            } catch (err) {
                console.error('Transaction failed:', err)
                db.run('ROLLBACK')
                // Re-enable foreign key checks even on error
                db.run('PRAGMA foreign_keys = ON')
                return reject({success: false, err, message: 'Insert organisation transaction failed'})
            }
        })
    })
}

// Thêm mới parent organization trong transaction (cho lớp cha gọi)
export const insertParentOrganizationTransaction = (parentOrganization, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            await organisationFunc.insertOrganisationTransaction(parentOrganization, dbsql)
            dbsql.run(`INSERT INTO parent_organization (mrid) VALUES (?) ON CONFLICT(mrid) DO NOTHING`, [parentOrganization.mrid], function (err) {
                if (err) {
                    return reject({success: false, err, message: 'Insert parent organization failed'})
                }
                return resolve({success: true, data: parentOrganization, message: 'Insert parent organization completed'})
            })
        } catch (err) {
            return reject({success: false, err, message: 'Insert organisation transaction failed'})
        }
    })
}

// Lấy parent Organization theo mrid (gộp cả cha)
export const getParentOrganizationById = async (mrid) => {
    try {
        const orgResult = await organisationFunc.getOrganisationById(mrid)
        if (!orgResult.success) {
            return {success: false, data: null, message: 'Organisation not found'}
        }
        return {success: true, data: orgResult.data, message: 'Get parent organization completed'}
    } catch (err) {
        return {success: false, err, message: 'Get parent organization failed'}
    }
}

// Lấy danh sách parent organizations theo parentId
export const getParentOrganizationByParentId = (parentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT o.*, i.*
             FROM organisation o
             JOIN identified_object i ON o.mrid = i.mrid
             WHERE o.parent_organisation = ?`,
            [parentId],
            (err, rows) => {
                if (err) {
                    return reject({success: false, err, message: 'Get parent organizations by parentId failed'})
                }
                if (!rows || rows.length === 0) {
                    return resolve({success: true, data: [], message: 'No parent organizations found'})
                }
                return resolve({success: true, data: rows, message: 'Get parent organizations by parentId completed'})
            }
        )
    })
}

// Cập nhật Organisation (gồm cả identified_object)
export const updateParentOrganizationById = (mrid, parentOrganization) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            db.run('BEGIN TRANSACTION')
            try {
                await organisationFunc.updateOrganisationByIdTransaction(mrid, parentOrganization, db)
                db.run('COMMIT')
                return resolve({success: true, data: parentOrganization, message: 'Update organisation completed'})
            } catch (err) {
                db.run('ROLLBACK')
                return reject({success: false, err, message: 'Update organisation failed'})
            }
        })
    })
}

// Cập nhật Organisation trong transaction (cho lớp cha gọi)
export const updateParentOrganizationTransaction = (mrid, parentOrganization, dbsql) => {
    return organisationFunc.updateOrganisationByIdTransaction(mrid, parentOrganization, dbsql)
}

// Xóa Organisation (gồm cả identified_object, dùng cascade)
export const deleteParentOrganizationById = (mrid) => {
    return organisationFunc.deleteOrganisationByIdTransaction(mrid)
}

// Xóa Organisation trong transaction (cho lớp cha gọi)
export const deleteParentOrganizationByIdTransaction = (mrid, dbsql) => {
    return organisationFunc.deleteOrganisationByIdTransaction(mrid, dbsql)
}
