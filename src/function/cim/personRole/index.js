import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới PersonRole (gồm cả insert identified_object)
export const insertPersonRole = async (personRole) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(personRole, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO person_role(
                            mrid,
                            department,
                            position,
                            person
                        ) VALUES (?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            department = excluded.department,
                            position = excluded.position,
                            person = excluded.person`,
                        [
                            personRole.mrid,
                            personRole.department,
                            personRole.position,
                            personRole.person
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert personRole failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: personRole, message: 'Insert personRole completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert personRole transaction failed' })
                })
        })
    })
}

// Thêm mới PersonRole trong transaction (cho lớp cha gọi)
export const insertPersonRoleTransaction = async (personRole, dbsql) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra xem record đã tồn tại chưa
        dbsql.get("SELECT * FROM person_role WHERE mrid = ?", [personRole.mrid], async (err, existingRow) => {
            if (err) {
                return reject({ success: false, err, message: 'Check existing personRole failed' })
            }
            
            if (existingRow) {
                // Record đã tồn tại, chỉ update những trường có giá trị
                identifiedObjectFunc.insertIdentifiedObjectTransaction(personRole, dbsql)
                    .then(identifiedResult => {
                        if (!identifiedResult.success) {
                            return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                        }
                        // Chỉ update những trường có giá trị (không null/undefined)
                        const updateFields = [];
                        const updateValues = [];
                        
                        if (personRole.person !== null && personRole.person !== undefined) {
                            updateFields.push('person = ?');
                            updateValues.push(personRole.person);
                        }
                        if (personRole.department !== null && personRole.department !== undefined) {
                            updateFields.push('department = ?');
                            updateValues.push(personRole.department);
                        }
                        if (personRole.position !== null && personRole.position !== undefined) {
                            updateFields.push('position = ?');
                            updateValues.push(personRole.position);
                        }
                        
                        if (updateFields.length === 0) {
                            // Không có trường nào cần update
                            return resolve({ success: true, data: personRole, message: 'PersonRole already exists, no changes needed' })
                        }
                        
                        updateValues.push(personRole.mrid);
                        dbsql.run(
                            `UPDATE person_role SET ${updateFields.join(', ')} WHERE mrid = ?`,
                            updateValues,
                            function (updateErr) {
                                if (updateErr) {
                                    return reject({ success: false, err: updateErr, message: 'Update personRole failed' })
                                }
                                return resolve({ success: true, data: personRole, message: 'Update personRole completed' })
                            }
                        )
                    })
                    .catch(err => {
                        return reject({ success: false, err, message: 'Update personRole transaction failed' })
                    })
            } else {
                // Record chưa tồn tại, insert mới
                identifiedObjectFunc.insertIdentifiedObjectTransaction(personRole, dbsql)
                    .then(identifiedResult => {
                        if (!identifiedResult.success) {
                            return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                        }
                        dbsql.run(
                            `INSERT INTO person_role(
                                mrid,
                                person,
                                department,
                                position
                            ) VALUES (?, ?, ?, ?)`,
                            [
                                personRole.mrid,
                                personRole.person || null,
                                personRole.department || null,
                                personRole.position || null
                            ],
                            function (insertErr) {
                                if (insertErr) {
                                    return reject({ success: false, err: insertErr, message: 'Insert personRole failed' })
                                }
                                return resolve({ success: true, data: personRole, message: 'Insert personRole completed' })
                            }
                        )
                    })
                    .catch(err => {
                        return reject({ success: false, err, message: 'Insert personRole transaction failed' })
                    })
            }
        })
    })
}

// Lấy PersonRole theo mrid (gộp cả cha)
export const getPersonRoleById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM person_role WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get personRole failed' })
                if (!row) return resolve({ success: false, data: null, message: 'PersonRole not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get personRole completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get personRole failed' }
    }
}

// Lấy PersonRole theo personId
export const getPersonRoleByPersonId = async (personId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM person_role WHERE person = ?", [personId], async (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get personRole failed' })
            if (!row) return resolve({ success: false, data: null, message: 'PersonRole not found' })
            try {
                const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(row.mrid)
                if (!identifiedResult.success) {
                    return resolve({ success: false, data: null, message: 'Identified object not found' })
                }
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data:data, message: 'Get personRole completed' })
            } catch (e) {
                return reject({ success: false, err: e, message: 'Get identified object failed' })
            }
        })
    })
}

// Cập nhật PersonRole (gồm cả identified_object)
export const updatePersonRole = async (mrid, personRole) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, personRole, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE person_role SET
                            department = ?,
                            position = ?,
                            person = ?
                        WHERE mrid = ?`,
                        [
                            personRole.department,
                            personRole.position,
                            personRole.person,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update personRole failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: personRole, message: 'Update personRole completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update personRole transaction failed' })
                })
        })
    })
}

// Cập nhật PersonRole trong transaction (cho lớp cha gọi)
export const updatePersonRoleTransaction = async (mrid, personRole, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, personRole, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE person_role SET
                        department = ?,
                        position = ?,
                        person = ?
                    WHERE mrid = ?`,
                    [
                        personRole.department,
                        personRole.position,
                        personRole.person,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update personRole failed' })
                        }
                        return resolve({ success: true, data: personRole, message: 'Update personRole completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update personRole transaction failed' })
            })
    })
}

// Xóa PersonRole (gồm cả identified_object, dùng cascade)
export const deletePersonRoleById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete personRole (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete personRole transaction failed' })
            })
    })
}

// Xóa PersonRole trong transaction (cho lớp cha gọi)
export const deletePersonRoleByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}