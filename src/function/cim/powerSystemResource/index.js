import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm mới PowerSystemResource (gồm cả insert identified_object)
export const insertPowerSystemResource = async (psr) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(psr, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    
                    // Normalize foreign keys - ensure empty strings and empty UUIDs become null
                    const normalizeFk = (value) => {
                        if (!value || value === '' || value === '00000000-0000-0000-0000-000000000000') {
                            return null;
                        }
                        return value;
                    };
                    
                    const normalizedPsrTypeId = normalizeFk(psr.psr_type_id);
                    const normalizedLocation = normalizeFk(psr.location);
                    
                    db.run(
                        `INSERT INTO power_system_resource(
                            mrid,
                            psr_type_id,
                            location
                        ) VALUES (?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            psr_type_id = excluded.psr_type_id,
                            location = excluded.location`,
                        [
                            psr.mrid,
                            normalizedPsrTypeId,
                            normalizedLocation
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert powerSystemResource failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: psr, message: 'Insert powerSystemResource completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert powerSystemResource transaction failed' })
                })
        })
    })
}

// Thêm mới PowerSystemResource trong transaction (cho lớp cha gọi)
export const insertPowerSystemResourceTransaction = async (psr, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(psr, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                
                // Normalize foreign keys - ensure empty strings and empty UUIDs become null
                const normalizeFk = (value) => {
                    if (!value || value === '' || value === '00000000-0000-0000-0000-000000000000') {
                        return null;
                    }
                    return value;
                };
                
                // Validate foreign keys exist before inserting
                const validateFkExists = (mrid, tableName) => {
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
                
                // Normalize and validate foreign keys
                const normalizedPsrTypeId = normalizeFk(psr.psr_type_id);
                const normalizedLocation = normalizeFk(psr.location);
                
                // Validate foreign keys exist in their respective tables
                Promise.all([
                    normalizedPsrTypeId ? validateFkExists(normalizedPsrTypeId, 'psr_type') : Promise.resolve(null),
                    normalizedLocation ? validateFkExists(normalizedLocation, 'location') : Promise.resolve(null)
                ]).then(([validatedPsrTypeId, validatedLocation]) => {
                    dbsql.run(
                        `INSERT INTO power_system_resource(
                            mrid,
                            psr_type_id,
                            location
                        ) VALUES (?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            psr_type_id = excluded.psr_type_id,
                            location = excluded.location`,
                        [
                            psr.mrid,
                            validatedPsrTypeId,
                            validatedLocation
                        ],
                        function (err) {
                            if (err) {
                                return reject({ success: false, err, message: 'Insert powerSystemResource failed' })
                            }
                            return resolve({ success: true, data: psr, message: 'Insert powerSystemResource completed' })
                        }
                    )
                }).catch(err => {
                    return reject({ success: false, err, message: 'Foreign key validation failed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert powerSystemResource transaction failed' })
            })
    })
}

// Lấy PowerSystemResource theo mrid (gộp cả cha)
export const getPowerSystemResourceById = async (mrid) => {
    try {
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM power_system_resource WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get powerSystemResource failed' })
                if (!row) return resolve({ success: false, data: null, message: 'PowerSystemResource not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data : data, message: 'Get powerSystemResource completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get powerSystemResource failed' }
    }
}

// Cập nhật PowerSystemResource (gồm cả identified_object)
export const updatePowerSystemResourceById = async (mrid, psr) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, psr, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    
                    // Normalize foreign keys - ensure empty strings and empty UUIDs become null
                    const normalizeFk = (value) => {
                        if (!value || value === '' || value === '00000000-0000-0000-0000-000000000000') {
                            return null;
                        }
                        return value;
                    };
                    
                    const normalizedPsrTypeId = normalizeFk(psr.psr_type_id);
                    const normalizedLocation = normalizeFk(psr.location);
                    
                    db.run(
                        `UPDATE power_system_resource SET
                            psr_type_id = ?,
                            location = ?
                        WHERE mrid = ?`,
                        [
                            normalizedPsrTypeId,
                            normalizedLocation,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update powerSystemResource failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: psr, message: 'Update powerSystemResource completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update powerSystemResource transaction failed' })
                })
        })
    })
}

// Cập nhật PowerSystemResource trong transaction (cho lớp cha gọi)
export const updatePowerSystemResourceByIdTransaction = async (mrid, psr, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, psr, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                
                // Normalize foreign keys - ensure empty strings and empty UUIDs become null
                const normalizeFk = (value) => {
                    if (!value || value === '' || value === '00000000-0000-0000-0000-000000000000') {
                        return null;
                    }
                    return value;
                };
                
                const normalizedPsrTypeId = normalizeFk(psr.psr_type_id);
                const normalizedLocation = normalizeFk(psr.location);
                
                dbsql.run(
                    `UPDATE power_system_resource SET
                        psr_type_id = ?,
                        location = ?
                    WHERE mrid = ?`,
                    [
                        normalizedPsrTypeId,
                        normalizedLocation,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update powerSystemResource failed' })
                        }
                        return resolve({ success: true, data: psr, message: 'Update powerSystemResource completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update powerSystemResource transaction failed' })
            })
    })
}

// Xóa PowerSystemResource (gồm cả identified_object, dùng cascade)
export const deletePowerSystemResourceById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete powerSystemResource (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete powerSystemResource transaction failed' })
            })
    })
}

// Xóa PowerSystemResource trong transaction (cho lớp cha gọi)
export const deletePowerSystemResourceByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}

// Lấy powerSystemResource theo locationId
export const getPowerSystemResourceByLocationIdTransaction = async (locationId, dbsql) => {
    try {
        return new Promise((resolve, reject) => {
            dbsql.all("SELECT * FROM power_system_resource WHERE location = ?", [locationId], (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get powerSystemResource failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'PowerSystemResource not found' })
                const data = rows.map(row => ({ ...row }))
                return resolve({ success: true, data: data, message: 'Get powerSystemResource completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get powerSystemResource failed' }
    }
}

// Lấy location theo powerSystemResourceId
export const getLocationByPowerSystemResourceId = async (psrId) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT l.*
                FROM power_system_resource psr
                JOIN location l ON psr.location = l.mrid
                WHERE psr.mrid = ?
            `;

            db.get(sql, [psrId], (err, row) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get location failed' });
                }
                if (!row) {
                    return resolve({ success: false, data: null, message: 'Location not found' });
                }
                return resolve({ success: true, data: row, message: 'Get location completed' });
            });
        });
    } catch (err) {
        return { success: false, err, message: 'Get location failed' };
    }
};