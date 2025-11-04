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
                            psr.psr_type_id,
                            psr.location
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
                // Normalize input: sometimes callers pass nested objects (e.g. { voltageLevel: { mrid,.. } })
                // so extract the real data source which contains mrid/name.
                let dataSource = psr
                if (psr.voltageLevel && typeof psr.voltageLevel === 'object' && psr.voltageLevel.mrid) {
                    dataSource = psr.voltageLevel
                } else if (psr.bay && typeof psr.bay === 'object' && psr.bay.mrid) {
                    dataSource = psr.bay
                } else if (psr.substation && typeof psr.substation === 'object' && psr.substation.mrid) {
                    dataSource = psr.substation
                }

                // resolve commonly used fields from either root or nested object
                const mrid = dataSource.mrid
                const psrTypeId = psr.psr_type_id || dataSource.psr_type_id || null
                const locationField = psr.location || dataSource.location || null
                const assetDatasheet = psr.asset_datasheet || dataSource.asset_datasheet || null

                // Insert reference records if they don't exist to satisfy foreign key constraints
                const insertPromises = []

                // Insert psr_type if psrTypeId exists
                // Note: psr_type table may have foreign key to identified_object
                if (psrTypeId) {
                    insertPromises.push(
                        new Promise(async (res, rej) => {
                            try {
                                // Insert identified_object first if needed
                                await identifiedObjectFunc.insertIdentifiedObjectTransaction({
                                    mrid: psrTypeId,
                                    name: psrTypeId // Use mrid as name if not provided
                                }, dbsql)
                                
                                // Then insert psr_type
                                dbsql.run(
                                    `INSERT OR IGNORE INTO psr_type(mrid) VALUES (?)`,
                                    [psrTypeId],
                                    (err) => {
                                        if (err) rej(err)
                                        else res()
                                    }
                                )
                            } catch (err) {
                                rej(err)
                            }
                        })
                    )
                }

                // Insert location if locationField exists
                // Note: location table has foreign key to identified_object, so we need to insert identified_object first
                if (locationField && typeof locationField === 'string') {
                    insertPromises.push(
                        new Promise(async (res, rej) => {
                            try {
                                // Insert identified_object first (required for location foreign key)
                                const identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction({
                                    mrid: locationField,
                                    name: locationField // Use mrid as name if not provided
                                }, dbsql)
                                
                                if (!identifiedResult.success) {
                                    return rej(new Error('Failed to insert identified_object for location: ' + (identifiedResult.message || 'Unknown error')))
                                }
                                
                                // Then insert location
                                dbsql.run(
                                    `INSERT OR IGNORE INTO location(mrid) VALUES (?)`,
                                    [locationField],
                                    (err) => {
                                        if (err) rej(err)
                                        else res()
                                    }
                                )
                            } catch (err) {
                                rej(err)
                            }
                        })
                    )
                } else if (locationField && typeof locationField === 'object' && locationField.mrid) {
                    insertPromises.push(
                        new Promise(async (res, rej) => {
                            try {
                                // Insert identified_object first (required for location foreign key)
                                const identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(locationField, dbsql)
                                
                                if (!identifiedResult.success) {
                                    return rej(new Error('Failed to insert identified_object for location: ' + (identifiedResult.message || 'Unknown error')))
                                }
                                
                                // Then insert location
                                dbsql.run(
                                    `INSERT OR IGNORE INTO location(mrid) VALUES (?)`,
                                    [locationField.mrid],
                                    (err) => {
                                        if (err) rej(err)
                                        else res()
                                    }
                                )
                            } catch (err) {
                                rej(err)
                            }
                        })
                    )
                }

                // Insert asset_info if assetDatasheet exists
                // Note: asset_info table may have foreign key to identified_object
                if (assetDatasheet) {
                    insertPromises.push(
                        new Promise(async (res, rej) => {
                            try {
                                // Insert identified_object first if needed
                                await identifiedObjectFunc.insertIdentifiedObjectTransaction({
                                    mrid: assetDatasheet,
                                    name: assetDatasheet // Use mrid as name if not provided
                                }, dbsql)
                                
                                // Then insert asset_info
                                dbsql.run(
                                    `INSERT OR IGNORE INTO asset_info(mrid) VALUES (?)`,
                                    [assetDatasheet],
                                    (err) => {
                                        if (err) rej(err)
                                        else res()
                                    }
                                )
                            } catch (err) {
                                rej(err)
                            }
                        })
                    )
                }

                // Wait for all reference inserts to complete
                Promise.all(insertPromises)
                    .then(() => {
                        // Extract location mrid if location is an object
                        const locationMrid = (typeof locationField === 'string')
                            ? locationField
                            : (locationField && typeof locationField === 'object' && locationField.mrid)
                                ? locationField.mrid
                                : null

                        // Logging removed to reduce console noise

                        // Now insert into power_system_resource using the normalized mrid and fields
                        dbsql.run(
                            `INSERT INTO power_system_resource(
                                mrid,
                                psr_type_id,
                                location,
                                asset_datasheet
                            ) VALUES (?, ?, ?, ?)
                            ON CONFLICT(mrid) DO UPDATE SET
                                psr_type_id = excluded.psr_type_id,
                                location = excluded.location,
                                asset_datasheet = excluded.asset_datasheet`,
                            [
                                mrid,
                                psrTypeId || null,
                                locationMrid,
                                assetDatasheet || null
                            ],
                            function (err) {
                                if (err) {
                                    return reject({ 
                                        success: false, 
                                        err: {
                                            message: err.message || 'Unknown error',
                                            code: err.code,
                                            errno: err.errno
                                        }, 
                                        message: 'Insert powerSystemResource failed: ' + err.message
                                    })
                                }
                                return resolve({ success: true, data: psr, message: 'Insert powerSystemResource completed' })
                            }
                        )
                    })
                    .catch(err => {
                        return reject({ 
                            success: false, 
                            err: {
                                message: err?.message || err?.err?.message || 'Unknown error',
                                code: err?.code || err?.err?.code,
                                errno: err?.errno || err?.err?.errno
                            }, 
                            message: 'Insert reference records failed: ' + (err?.message || err?.err?.message || 'Unknown error')
                        })
                    })
            })
            .catch(err => {
                return reject({ 
                    success: false, 
                    err: {
                        message: err?.message || err?.err?.message || 'Unknown error',
                        code: err?.code || err?.err?.code,
                        errno: err?.errno || err?.err?.errno
                    }, 
                    message: 'Insert powerSystemResource transaction failed: ' + (err?.message || err?.err?.message || 'Unknown error')
                })
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
                    db.run(
                        `UPDATE power_system_resource SET
                            psr_type_id = ?,
                            location = ?
                        WHERE mrid = ?`,
                        [
                            psr.psr_type_id,
                            psr.location,
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
                dbsql.run(
                    `UPDATE power_system_resource SET
                        psr_type_id = ?,
                        location = ?
                    WHERE mrid = ?`,
                    [
                        psr.psr_type_id,
                        psr.location,
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
