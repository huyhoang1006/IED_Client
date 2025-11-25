import db from '../../../../electron/db.js'
import * as organisationFunc from '../organisation/index.js'

// Thêm mới Parent Organisation (gồm cả insert identified_object)
export const insertParentOrganisation = async (parentOrganization) => {
    return new Promise((resolve, reject) => {
        // db.serialize(() => {
        //     db.run('BEGIN TRANSACTION')
        //     organisationFunc.insertOrganisationTransaction(parentOrganization, db)
        //         .then(parentOrganizationResult => {
        //             if (!parentOrganizationResult.success) {
        //                 db.run('ROLLBACK')
        //                 return reject({ success: false, message: 'Insert parent organisation failed', err: parentOrganizationResult.err })
        //             }
        //             db.run(
        //                 `INSERT INTO parent_organization(mrid) VALUES (?)
        //                  ON CONFLICT(mrid) DO UPDATE SET DO NOTHING`,
        //                 [
        //                     parentOrganization.mrid,
        //                 ],
        //                 function (err) {
        //                     if (err) {
        //                         db.run('ROLLBACK')
        //                         return reject({ success: false, err, message: 'Insert organisation failed' })
        //                     }
        //                     db.run('COMMIT')
        //                     return resolve({ success: true, data: parentOrganization, message: 'Insert organisation completed' })
        //                 }
        //             )
        //         })
        //         .catch(err => {
        //             db.run('ROLLBACK')
        //             return reject({ success: false, err, message: 'Insert organisation transaction failed' })
        //         })
        // })
    })
}

// Thêm mới parent organization trong transaction (cho lớp cha gọi)
export const insertParentOrganizationTransaction = async (parentOrganization, dbsql) => {
    return new Promise((resolve, reject) => {
        organisationFunc.insertOrganisationTransaction(parentOrganization, dbsql)
            .then(parentResult => {
                if (!parentResult.success) {
                    return reject({ success: false, message: parentResult.message || 'Insert parent organization failed', err: parentResult.err })
                }
                
                // Insert directly into parent_organization table
                // Note: We trust insertOrganisationTransaction's verification, so we don't verify again here
                // If organisation doesn't exist, the foreign key constraint will fail and we'll get a proper error
                dbsql.run(
                    `INSERT INTO parent_organization (
                        mrid
                    ) VALUES (?)
                    ON CONFLICT(mrid) DO NOTHING`,
                    [
                        parentOrganization.mrid,
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert parent organization failed' })
                        }
                        return resolve({ success: true, data: parentOrganization, message: 'Insert parent organization completed' })
                    }
                );
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert organisation transaction failed' })
            })
    })
}

// Lấy parent Organization theo mrid (gộp cả cha)
export const getParentOrganizationById = async (mrid) => {
    try {
        const orgResult = await organisationFunc.getOrganisationById(mrid)
        if (!orgResult.success) {
            return { success: false, data: null, message: 'Organisation not found' }
        }
        
        // Lấy thông tin person_role nếu có (qua organisation_person và person)
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT pr.department, pr.position 
                 FROM organisation_person op
                 LEFT JOIN person p ON p.mrid = op.person_id
                 LEFT JOIN person_role pr ON pr.person = p.mrid
                 WHERE op.organisation_id = ? 
                 LIMIT 1`,
                [mrid],
                (err, personRole) => {
                    if (err) {
                        // Nếu có lỗi khi lấy person_role, vẫn trả về organisation data
                        return resolve({ 
                            success: true, 
                            data: orgResult.data, 
                            message: 'Get parent organization completed (without person role)' 
                        })
                    }
                    
                    // Merge dữ liệu organisation với person_role
                    const data = {
                        ...orgResult.data,
                        department: personRole?.department || null,
                        position: personRole?.position || null
                    }
                    
                    return resolve({ success: true, data: data, message: 'Get parent organization completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get parent organization failed' }
    }
}

// Lấy danh sách parent organizations theo parentId
export const getParentOrganizationByParentId = async (parentId) => {
    return new Promise((resolve, reject) => {
        const ROOT_ID = '00000000-0000-0000-0000-000000000000';

        let query, params;
        
        if (parentId === ROOT_ID || parentId === null) {
            query = `SELECT o.*, i.*, pr.department, pr.position
                     FROM organisation o
                     JOIN identified_object i ON o.mrid = i.mrid
                     LEFT JOIN organisation_person op ON op.organisation_id = o.mrid
                     LEFT JOIN person p ON p.mrid = op.person_id
                     LEFT JOIN person_role pr ON pr.person = p.mrid
                     WHERE (o.parent_organisation IS NULL OR o.parent_organisation = ?)
                     AND o.mrid != ?`;
            params = [ROOT_ID, ROOT_ID];
        } else {
            query = `SELECT o.*, i.*, pr.department, pr.position
                     FROM organisation o
                     JOIN identified_object i ON o.mrid = i.mrid
                     LEFT JOIN organisation_person op ON op.organisation_id = o.mrid
                     LEFT JOIN person p ON p.mrid = op.person_id
                     LEFT JOIN person_role pr ON pr.person = p.mrid
                     WHERE o.parent_organisation = ?`;
            params = [parentId];
        }
        
        db.all(query, params, (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get parent organizations by parentId failed' })
            }
            if (!rows || rows.length === 0) {
                return resolve({ success: true, data: [], message: 'No parent organizations found' })
            }
            return resolve({ success: true, data: rows, message: 'Get parent organizations by parentId completed' })
        })
    })
}

// Cập nhật Organisation (gồm cả identified_object)
export const updateParentOrganizationById = async (mrid, parentOrganization) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            organisationFunc.updateOrganisationByIdTransaction(mrid, parentOrganization, db)
                .then(parentResult => {
                    if (!parentResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update parent organization failed', err: parentResult.err })
                    }
                    db.run(
                        `UPDATE parent_organization SET
                            mrid = ? 
                        WHERE mrid = ?`,
                        [
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update organisation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: parentOrganization, message: 'Update organisation completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update organisation transaction failed' })
                })
        })
    })
}

// Cập nhật Organisation trong transaction (cho lớp cha gọi)
export const updateParentOrganizationTransaction = async (mrid, parentOrganization, dbsql) => {
    return new Promise((resolve, reject) => {
        organisationFunc.updateOrganisationByIdTransaction(mrid, parentOrganization, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE parent_organization SET
                            mrid = ? 
                        WHERE mrid = ?`,
                    [
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update organisation failed' })
                        }
                        return resolve({ success: true, data: parentOrganization, message: 'Update organisation completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update parent transaction failed' })
            })
    })
}

// Xóa Organisation (gồm cả identified_object, dùng cascade)
export const deleteParentOrganizationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        organisationFunc.deleteOrganisationByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete organisation (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete organisation transaction failed' })
            })
    })
}

// Xóa Organisation trong transaction (cho lớp cha gọi)
export const deleteParentOrganizationByIdTransaction = async (mrid, dbsql) => {
    return organisationFunc.deleteOrganisationByIdTransaction(mrid, dbsql)
}