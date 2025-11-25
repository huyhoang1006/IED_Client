import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới Organisation (gồm cả insert identified_object)
export const insertOrganisation = async (organisation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION', (beginErr) => {
                if (beginErr) {
                    return reject({ success: false, err: beginErr, message: 'Begin transaction failed' })
                }
                identifiedObjectFunc.insertIdentifiedObjectTransaction(organisation, db)
                    .then(identifiedResult => {
                        if (!identifiedResult.success) {
                            db.run('ROLLBACK', (rollbackErr) => {
                                if (rollbackErr) {
                                    console.error('Rollback error:', rollbackErr)
                                }
                                return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                            })
                            return
                        }
                        db.run(
                            `INSERT INTO organisation(
                                mrid,
                                electronic_address,
                                phone,
                                postal_address,
                                street_address,
                                tax_code,
                                parent_organisation
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(mrid) DO UPDATE SET
                                electronic_address = excluded.electronic_address,
                                phone = excluded.phone,
                                postal_address = excluded.postal_address,
                                street_address = excluded.street_address,
                                tax_code = excluded.tax_code,
                                parent_organisation = excluded.parent_organisation`,
                            [
                                organisation.mrid,
                                organisation.electronic_address,
                                organisation.phone,
                                organisation.postal_address,
                                organisation.street_address,
                                organisation.tax_code,
                                organisation.parent_organisation
                            ],
                            function (err) {
                                if (err) {
                                    db.run('ROLLBACK', (rollbackErr) => {
                                        if (rollbackErr) {
                                            console.error('Rollback error:', rollbackErr)
                                        }
                                        return reject({ success: false, err, message: 'Insert organisation failed' })
                                    })
                                    return
                                }
                                // Insert vào parent_organization vì root và organisation giống nhau
                                db.run(
                                    `INSERT INTO parent_organization (mrid) VALUES (?)
                                    ON CONFLICT(mrid) DO NOTHING`,
                                    [organisation.mrid],
                                    function (parentErr) {
                                        if (parentErr) {
                                            db.run('ROLLBACK', (rollbackErr) => {
                                                if (rollbackErr) {
                                                    console.error('Rollback error:', rollbackErr)
                                                }
                                                return reject({ success: false, err: parentErr, message: 'Insert parent organization failed' })
                                            })
                                            return
                                        }
                                        db.run('COMMIT', (commitErr) => {
                                            if (commitErr) {
                                                return reject({ success: false, err: commitErr, message: 'Commit transaction failed' })
                                            }
                                            return resolve({ success: true, data: organisation, message: 'Insert organisation completed' })
                                        })
                                    }
                                )
                            }
                        )
                    })
                    .catch(err => {
                        db.run('ROLLBACK', (rollbackErr) => {
                            if (rollbackErr) {
                                console.error('Rollback error:', rollbackErr)
                            }
                            return reject({ success: false, err, message: 'Insert organisation transaction failed' })
                        })
                    })
            })
        })
    })
}

// Thêm mới Organisation trong transaction (cho lớp cha gọi)
export const insertOrganisationTransaction = async (organisation, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(organisation, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO organisation(
                        mrid,
                        electronic_address,
                        phone,
                        postal_address,
                        street_address,
                        tax_code,
                        parent_organisation
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        electronic_address = excluded.electronic_address,
                        phone = excluded.phone,
                        postal_address = excluded.postal_address,
                        street_address = excluded.street_address,
                        tax_code = excluded.tax_code,
                        parent_organisation = excluded.parent_organisation`,
                    [
                        organisation.mrid,
                        organisation.electronic_address,
                        organisation.phone,
                        organisation.postal_address,
                        organisation.street_address,
                        organisation.tax_code,
                        organisation.parent_organisation
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert organisation failed' })
                        }
                        // Insert vào parent_organization vì root và organisation giống nhau
                        dbsql.run(
                            `INSERT INTO parent_organization (mrid) VALUES (?)
                            ON CONFLICT(mrid) DO NOTHING`,
                            [organisation.mrid],
                            function (parentErr) {
                                if (parentErr) {
                                    return reject({ success: false, err: parentErr, message: 'Insert parent organization failed' })
                                }
                                return resolve({ success: true, data: organisation, message: 'Insert organisation completed' })
                            }
                        )
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert organisation transaction failed' })
            })
    })
}

// Lấy Organisation theo mrid (gộp cả cha)
export const getOrganisationById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM organisation WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get organisation failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Organisation not found' })
                
                // Lấy thông tin person_role nếu có (qua organisation_person và person)
                db.get(
                    `SELECT pr.department, pr.position 
                     FROM organisation_person op
                     LEFT JOIN person p ON p.mrid = op.person_id
                     LEFT JOIN person_role pr ON pr.person = p.mrid
                     WHERE op.organisation_id = ? 
                     LIMIT 1`,
                    [mrid],
                    (personRoleErr, personRole) => {
                        if (personRoleErr) {
                            // Nếu có lỗi khi lấy person_role, vẫn trả về organisation data
                            const data = { ...identifiedResult.data, ...row }
                            return resolve({ success: true, data: data, message: 'Get organisation completed (without person role)' })
                        }
                        
                        // Merge dữ liệu organisation với person_role
                        const data = {
                            ...identifiedResult.data,
                            ...row,
                            department: personRole?.department || null,
                            position: personRole?.position || null
                        }
                        return resolve({ success: true, data: data, message: 'Get organisation completed' })
                    }
                )
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get organisation failed' }
    }
}

// Cập nhật Organisation (gồm cả identified_object)
export const updateOrganisationById = async (mrid, organisation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION', (beginErr) => {
                if (beginErr) {
                    return reject({ success: false, err: beginErr, message: 'Begin transaction failed' })
                }
                identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, organisation, db)
                    .then(identifiedResult => {
                        if (!identifiedResult.success) {
                            db.run('ROLLBACK', (rollbackErr) => {
                                if (rollbackErr) {
                                    console.error('Rollback error:', rollbackErr)
                                }
                                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                            })
                            return
                        }
                        db.run(
                            `UPDATE organisation SET
                                electronic_address = ?,
                                phone = ?,
                                postal_address = ?,
                                street_address = ?,
                                tax_code = ?,
                                parent_organisation = ?
                            WHERE mrid = ?`,
                            [
                                organisation.electronic_address,
                                organisation.phone,
                                organisation.postal_address,
                                organisation.street_address,
                                organisation.tax_code,
                                organisation.parent_organisation,
                                mrid
                            ],
                            function (err) {
                                if (err) {
                                    db.run('ROLLBACK', (rollbackErr) => {
                                        if (rollbackErr) {
                                            console.error('Rollback error:', rollbackErr)
                                        }
                                        return reject({ success: false, err, message: 'Update organisation failed' })
                                    })
                                    return
                                }
                                db.run('COMMIT', (commitErr) => {
                                    if (commitErr) {
                                        return reject({ success: false, err: commitErr, message: 'Commit transaction failed' })
                                    }
                                    return resolve({ success: true, data: organisation, message: 'Update organisation completed' })
                                })
                            }
                        )
                    })
                    .catch(err => {
                        db.run('ROLLBACK', (rollbackErr) => {
                            if (rollbackErr) {
                                console.error('Rollback error:', rollbackErr)
                            }
                            return reject({ success: false, err, message: 'Update organisation transaction failed' })
                        })
                    })
            })
        })
    })
}

// Cập nhật Organisation trong transaction (cho lớp cha gọi)
export const updateOrganisationByIdTransaction = async (mrid, organisation, dbsql) => {
    return new Promise(async (resolve, reject) => {
        if (!mrid) {
            return reject({ success: false, err: new Error('MRID is required'), message: 'MRID is required for update' })
        }
        if (!organisation) {
            return reject({ success: false, err: new Error('Organisation data is required'), message: 'Organisation data is required for update' })
        }
        
        try {
            // Check if identified_object exists first
            let identifiedObjectExists = false;
            try {
                const checkResult = await new Promise((resolveCheck, rejectCheck) => {
                    dbsql.get("SELECT mrid FROM identified_object WHERE mrid = ?", [mrid], (err, row) => {
                        if (err) {
                            rejectCheck(err);
                        } else {
                            resolveCheck({ exists: !!row });
                        }
                    });
                });
                identifiedObjectExists = checkResult.exists;
            } catch (checkErr) {
                // If check fails, assume it doesn't exist and try to insert
                console.warn('Error checking identified_object existence, will try to insert:', checkErr);
                identifiedObjectExists = false;
            }
            
            let identifiedResult;
            if (!identifiedObjectExists) {
                // If identified_object doesn't exist, insert it first
                console.log('Identified object not found, inserting new one for mrid:', mrid);
                identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction({
                    mrid: mrid,
                    name: organisation.name || null,
                    alias_name: organisation.alias_name || null,
                    description: organisation.description || null
                }, dbsql);
            } else {
                // If exists, update it
                identifiedResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, organisation, dbsql);
            }
            
            if (!identifiedResult.success) {
                console.error('Update/Insert identified object failed:', identifiedResult.err, identifiedResult.message)
                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
            }
            
            dbsql.run(
                `UPDATE organisation SET
                    electronic_address = ?,
                    phone = ?,
                    postal_address = ?,
                    street_address = ?,
                    tax_code = ?,
                    parent_organisation = ?
                WHERE mrid = ?`,
                [
                    organisation.electronic_address || null,
                    organisation.phone || null,
                    organisation.postal_address || null,
                    organisation.street_address || null,
                    organisation.tax_code || null,
                    organisation.parent_organisation || null,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update organisation failed: ' + (err.message || err) })
                    }
                    return resolve({ success: true, data: organisation, message: 'Update organisation completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update organisation transaction failed: ' + (err?.message || err) })
        }
    })
}

// Xóa Organisation (gồm cả identified_object, dùng cascade)
export const deleteOrganisationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
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
export const deleteOrganisationByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}