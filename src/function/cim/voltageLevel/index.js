import db from '../../datacontext/index.js'
import * as equipmentContainerFunc from '../equipmentContainer/index.js'
import * as voltageFunc from '../voltage/index.js'
import { v4 as newUuid } from 'uuid'

export const insertVoltageLevel = async (voltageLevel) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            insertVoltageLevelTransaction(voltageLevel, db)
                .then(result => {
                    db.run('COMMIT')
                    return resolve(result)
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert VoltageLevel transaction failed' })
                })
        })
    })
}

export const insertVoltageLevelTransaction = async (voltageLevel, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.insertEquipmentContainerTransaction(voltageLevel, dbsql)
            .then(result => {
                if (!result.success) {
                    const errObj = result.err || {}
                    const sqlErrorMsg = errObj.message || result.message || 'Unknown error'
                    return reject({ 
                        success: false, 
                        message: 'Insert EquipmentContainer failed: ' + sqlErrorMsg, 
                        err: {
                            message: errObj.message || sqlErrorMsg,
                            code: errObj.code,
                            errno: errObj.errno
                        }
                    })
                }
                const insertVoltagePromises = []

                // Insert cả 3 voltage limits cùng lúc (high, low, base)
                if (voltageLevel.high_voltage_limit) {
                    insertVoltagePromises.push(
                        voltageFunc.insertVoltageTransaction({
                            mrid: voltageLevel.high_voltage_limit,
                            value: voltageLevel.high_voltage_limit_value !== null && voltageLevel.high_voltage_limit_value !== undefined ? voltageLevel.high_voltage_limit_value : null,
                            multiplier: voltageLevel.high_voltage_limit_multiplier || null,
                            unit: voltageLevel.high_voltage_limit_unit || null
                        }, dbsql)
                    )
                }

                if (voltageLevel.low_voltage_limit) {
                    insertVoltagePromises.push(
                        voltageFunc.insertVoltageTransaction({
                            mrid: voltageLevel.low_voltage_limit,
                            value: voltageLevel.low_voltage_limit_value !== null && voltageLevel.low_voltage_limit_value !== undefined ? voltageLevel.low_voltage_limit_value : null,
                            multiplier: voltageLevel.low_voltage_limit_multiplier || null,
                            unit: voltageLevel.low_voltage_limit_unit || null
                        }, dbsql)
                    )
                }

                if (voltageLevel.base_voltage || (voltageLevel.base_voltage_value !== null && voltageLevel.base_voltage_value !== undefined)) {
                    // Nếu có base_voltage_value nhưng chưa có base_voltage mrid, tạo mới
                    if (!voltageLevel.base_voltage && (voltageLevel.base_voltage_value !== null && voltageLevel.base_voltage_value !== undefined)) {
                        // Tạo UUID mới cho base_voltage nếu chưa có
                        voltageLevel.base_voltage = newUuid()
                    }
                    
                    if (voltageLevel.base_voltage) {
                        insertVoltagePromises.push(
                            voltageFunc.insertVoltageTransaction({
                                mrid: voltageLevel.base_voltage,
                                value: voltageLevel.base_voltage_value !== null && voltageLevel.base_voltage_value !== undefined ? voltageLevel.base_voltage_value : null,
                                multiplier: voltageLevel.base_voltage_multiplier || null,
                                unit: voltageLevel.base_voltage_unit || null
                            }, dbsql)
                        )
                    }
                }

                // Đợi tất cả voltage insert hoàn thành trước khi validate và insert voltage_level
                const processAfterVoltageInsert = () => {
                    if (!voltageLevel.mrid) {
                        return reject({ success: false, err: 'mrid is missing', message: 'Insert VoltageLevel failed: mrid is required' })
                    }

                    // KIỂM TRA MỘT LẦN: Tất cả foreign keys phải tồn tại trước khi insert
                    // SQLite FOREIGN KEY constraint sẽ tự động kiểm tra khi insert, nhưng ta kiểm tra trước để có error message rõ ràng hơn
                    return new Promise((resolve, reject) => {
                        const checks = []
                            
                            // Check equipment_container (mrid) - bắt buộc
                            checks.push(
                                new Promise((r) => {
                                    dbsql.get('SELECT mrid FROM equipment_container WHERE mrid = ?', [voltageLevel.mrid], (err, row) => {
                                        if (err || !row) {
                                            return r({ type: 'equipment_container', mrid: voltageLevel.mrid, exists: false, err })
                                        }
                                        return r({ type: 'equipment_container', mrid: voltageLevel.mrid, exists: true })
                                    })
                                })
                            )
                            
                            // Check base_voltage nếu có
                            if (voltageLevel.base_voltage) {
                                checks.push(
                                    new Promise((r) => {
                                        dbsql.get('SELECT mrid FROM voltage WHERE mrid = ?', [voltageLevel.base_voltage], (err, row) => {
                                            if (err || !row) {
                                                return r({ type: 'base_voltage', mrid: voltageLevel.base_voltage, exists: false, err })
                                            }
                                            return r({ type: 'base_voltage', mrid: voltageLevel.base_voltage, exists: true })
                                        })
                                    })
                                )
                            }
                            
                            // Check substation nếu có
                            if (voltageLevel.substation) {
                                checks.push(
                                    new Promise((r) => {
                                        dbsql.get('SELECT mrid FROM substation WHERE mrid = ?', [voltageLevel.substation], (err, row) => {
                                            if (err || !row) {
                                                return r({ type: 'substation', mrid: voltageLevel.substation, exists: false, err })
                                            }
                                            return r({ type: 'substation', mrid: voltageLevel.substation, exists: true })
                                        })
                                    })
                                )
                            }
                            
                            // Check high_voltage_limit nếu có
                            if (voltageLevel.high_voltage_limit) {
                                checks.push(
                                    new Promise((r) => {
                                        dbsql.get('SELECT mrid FROM voltage WHERE mrid = ?', [voltageLevel.high_voltage_limit], (err, row) => {
                                            if (err || !row) {
                                                return r({ type: 'high_voltage_limit', mrid: voltageLevel.high_voltage_limit, exists: false, err })
                                            }
                                            return r({ type: 'high_voltage_limit', mrid: voltageLevel.high_voltage_limit, exists: true })
                                        })
                                    })
                                )
                            }
                            
                            // Check low_voltage_limit nếu có
                            if (voltageLevel.low_voltage_limit) {
                                checks.push(
                                    new Promise((r) => {
                                        dbsql.get('SELECT mrid FROM voltage WHERE mrid = ?', [voltageLevel.low_voltage_limit], (err, row) => {
                                            if (err || !row) {
                                                return r({ type: 'low_voltage_limit', mrid: voltageLevel.low_voltage_limit, exists: false, err })
                                            }
                                            return r({ type: 'low_voltage_limit', mrid: voltageLevel.low_voltage_limit, exists: true })
                                        })
                                    })
                                )
                            }
                            
                        Promise.all(checks).then(results => {
                            const failedChecks = results.filter(r => !r.exists)
                            if (failedChecks.length > 0) {
                                const failedMsgs = failedChecks.map(r => `${r.type}(${r.mrid}) does not exist`).join(', ')
                                return reject(new Error(`Foreign key validation failed: ${failedMsgs}`))
                            }
                            return resolve(true)
                        })
                    })
                    .catch(verifyErr => {
                        return reject({
                            success: false,
                            err: verifyErr,
                            message: `Insert VoltageLevel failed: Foreign key validation failed - ${verifyErr.message || 'Unknown error'}`
                        })
                    })
                        .then(() => {
                            dbsql.run(
                            `INSERT INTO voltage_level(mrid, high_voltage_limit, low_voltage_limit, base_voltage, substation)
                             VALUES (?, ?, ?, ?, ?)
                             ON CONFLICT(mrid) DO UPDATE SET
                                high_voltage_limit = excluded.high_voltage_limit,
                                low_voltage_limit = excluded.low_voltage_limit,
                                base_voltage = excluded.base_voltage,
                                substation = excluded.substation`,
                            [voltageLevel.mrid, voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation],
                            function (err) {
                                if (err) {
                                    // Nếu lỗi FOREIGN KEY constraint, kiểm tra lại từng foreign key để tìm ra cái nào fail
                                    if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY')) {
                                        const failedChecks = []
                                        
                                        // Check từng foreign key một cách tuần tự để tìm ra cái nào fail
                                        const checkSequentially = () => {
                                            return new Promise((resolve) => {
                                                const checks = []
                                                
                                                if (voltageLevel.base_voltage) {
                                                    checks.push(
                                                        new Promise((r) => {
                                                            dbsql.get('SELECT mrid FROM voltage WHERE mrid = ?', [voltageLevel.base_voltage], (e, row) => {
                                                                if (e || !row) failedChecks.push(`base_voltage=${voltageLevel.base_voltage}`)
                                                                r()
                                                            })
                                                        })
                                                    )
                                                }
                                                
                                                if (voltageLevel.substation) {
                                                    checks.push(
                                                        new Promise((r) => {
                                                            dbsql.get('SELECT mrid FROM substation WHERE mrid = ?', [voltageLevel.substation], (e, row) => {
                                                                if (e || !row) failedChecks.push(`substation=${voltageLevel.substation}`)
                                                                r()
                                                            })
                                                        })
                                                    )
                                                }
                                                
                                                Promise.all(checks).then(() => {
                                                    const failedMsg = failedChecks.length > 0 
                                                        ? ` Failed foreign keys: ${failedChecks.join(', ')}`
                                                        : ' Could not identify which foreign key failed.'
                                                    resolve(failedMsg)
                                                })
                                            })
                                        }
                                        
                                        checkSequentially().then(failedMsg => {
                                            return reject({ 
                                                success: false, 
                                                err: {
                                                    message: err.message,
                                                    code: err.code,
                                                    errno: err.errno
                                                }, 
                                                message: `Insert VoltageLevel failed: ${err.message}.${failedMsg} All foreign keys checked: mrid=${voltageLevel.mrid}, high_voltage_limit=${voltageLevel.high_voltage_limit}, low_voltage_limit=${voltageLevel.low_voltage_limit}, base_voltage=${voltageLevel.base_voltage}, substation=${voltageLevel.substation}`
                                            })
                                        })
                                    } else {
                                        return reject({ 
                                            success: false, 
                                            err: {
                                                message: err.message,
                                                code: err.code,
                                                errno: err.errno
                                            }, 
                                            message: `Insert VoltageLevel failed: ${err.message}. Checked foreign keys: mrid=${voltageLevel.mrid}, high_voltage_limit=${voltageLevel.high_voltage_limit}, low_voltage_limit=${voltageLevel.low_voltage_limit}, base_voltage=${voltageLevel.base_voltage}, substation=${voltageLevel.substation}`
                                        })
                                    }
                                }

                                dbsql.get('SELECT mrid FROM voltage_level WHERE mrid = ?', [voltageLevel.mrid], (verifyErr, verifyRow) => {
                                    if (verifyErr) {
                                        return reject({
                                            success: false,
                                            err: { message: verifyErr.message, code: verifyErr.code },
                                            message: `Insert VoltageLevel failed: Cannot verify insert - ${verifyErr.message}`
                                        })
                                    }
                                    if (!verifyRow) {
                                        return reject({
                                            success: false,
                                            err: { message: 'Insert verification failed' },
                                            message: `Insert VoltageLevel failed: Record was not inserted into voltage_level table (mrid: ${voltageLevel.mrid})`
                                        })
                                    }

                                    return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                                })
                            }
                            )
                        })
                        .catch(err => {
                            const errorMsg = err?.err?.message || err?.message || err?.toString() || 'Unknown error'
                            return reject({ 
                                success: false, 
                                err: {
                                    message: err?.message,
                                    errMessage: err?.err?.message,
                                    errCode: err?.err?.code
                                }, 
                                message: 'Insert VoltageLevel failed: ' + errorMsg
                            })
                        })
                }
                
                // Xử lý voltage insert
                if (insertVoltagePromises.length === 0) {
                    // Không có voltage nào cần insert, tiếp tục với foreign key check
                    processAfterVoltageInsert()
                        .catch(err => {
                            // Nếu có lỗi trong processAfterVoltageInsert, reject ngay
                            return reject(err)
                        })
                } else {
                    Promise.all(insertVoltagePromises)
                        .then((results) => {
                            // Kiểm tra kết quả của từng voltage insert
                            if (results && results.length > 0) {
                                const failedInserts = results.filter(r => !r || !r.success)
                                if (failedInserts.length > 0) {
                                    const errorDetails = failedInserts.map((r, index) => {
                                        const voltageType = index === 0 ? 'high_voltage_limit' : 
                                                          index === 1 ? 'low_voltage_limit' : 'base_voltage'
                                        const errorMsg = r?.message || r?.err?.message || r?.err?.err?.message || r?.toString() || 'Unknown error'
                                        return `${voltageType}: ${errorMsg}`
                                    }).join('; ')
                                    const errorMessages = failedInserts.map(r => {
                                        if (r?.message) return r.message
                                        if (r?.err?.message) return r.err.message
                                        if (r?.err?.err?.message) return r.err.err.message
                                        if (r?.toString) return r.toString()
                                        return 'Unknown error'
                                    }).join('; ')
                                    return reject({ 
                                        success: false, 
                                        err: { message: errorMessages },
                                        message: `Insert VoltageLevel failed: One or more voltage inserts failed - ${errorDetails}`
                                    })
                                }
                            }
                            // Tiếp tục với foreign key check
                            return processAfterVoltageInsert()
                        })
                        .catch((err) => {
                            // Khi Promise.all reject, err là error object từ promise đầu tiên fail
                            const errorMsg = err?.message || err?.err?.message || err?.err?.err?.message || err?.toString() || 'Unknown error'
                            const errorDetails = `Voltage insert failed: ${errorMsg}`
                            return reject({ 
                                success: false, 
                                err: {
                                    message: err?.message || errorMsg,
                                    errMessage: err?.err?.message || errorMsg,
                                    errCode: err?.err?.code || err?.code
                                },
                                message: `Insert VoltageLevel failed: One or more voltage inserts failed - ${errorDetails}`
                            })
                        })
                }
            })
            .catch(err => {
                // If error comes from equipmentContainer, it will have detailed error info
                const errObj = err?.err || err || {}
                const errorMsg = errObj.message || err?.message || err?.toString() || 'Unknown error'
                return reject({ 
                    success: false, 
                    err: {
                        message: errObj.message || err?.message || errorMsg,
                        code: errObj.code || err?.code,
                        errno: errObj.errno || err?.errno
                    }, 
                    message: 'Insert VoltageLevel transaction failed: ' + errorMsg
                })
            })
    })
}

export const getVoltageLevelById = async (mrid) => {
    try {
        if (!mrid) {
            return { success: false, data: null, message: 'mrid is required', err: null }
        }
        const ecResult = await equipmentContainerFunc.getEquipmentContainerById(mrid)
        if (!ecResult.success) {
            return { success: false, data: null, message: ecResult.message || 'EquipmentContainer not found', err: ecResult.err || null }
        }
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    vl.*,
                    hvl.value as high_voltage_limit_value,
                    hvl.multiplier as high_voltage_limit_multiplier,
                    hvl.unit as high_voltage_limit_unit,
                    lvl.value as low_voltage_limit_value,
                    lvl.multiplier as low_voltage_limit_multiplier,
                    lvl.unit as low_voltage_limit_unit,
                    bv.value as base_voltage_value,
                    bv.multiplier as base_voltage_multiplier,
                    bv.unit as base_voltage_unit
                FROM voltage_level vl
                LEFT JOIN voltage hvl ON vl.high_voltage_limit = hvl.mrid
                LEFT JOIN voltage lvl ON vl.low_voltage_limit = lvl.mrid
                LEFT JOIN voltage bv ON vl.base_voltage = bv.mrid
                WHERE vl.mrid = ?
            `
            db.get(sql, [mrid], (err, row) => {
                if (err) {
                    return resolve({ success: false, data: null, message: `Get VoltageLevel failed: ${err.message || err}`, err: err })
                }
                if (!row) {
                    return resolve({ success: false, data: null, message: 'VoltageLevel not found' })
                }
                const data = { ...ecResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
            })
        })
    } catch (err) {
        return { success: false, data: null, message: `Get VoltageLevel failed: ${err.message || err}`, err: err }
    }
}

export const getVoltageLevelsBySubstationId = (substationId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT  vl.*, io.* FROM voltage_level vl
                               JOIN identified_object io ON vl.mrid = io.mrid
                               WHERE vl.substation = ? `;

        db.all(sql, [substationId], (err, rows) => {
            if (err) {
                return reject({
                    success: false,
                    data: null,
                    message: 'Get VoltageLevels by substation failed',
                    err
                });
            }

            if (!rows || rows.length === 0) {
                return resolve({
                    success: false,
                    data: [],
                    message: 'No voltage levels found for this substation'
                });
            }

            return resolve({
                success: true,
                data: rows,
                message: 'Get VoltageLevels by substation completed'
            });
        });
    });
};

export const updateVoltageLevelById = async (mrid, voltageLevel) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, voltageLevel, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `UPDATE voltage_level SET
                            high_voltage_limit = ?,
                            low_voltage_limit = ?,
                            base_voltage = ?,
                            substation = ?
                        WHERE mrid = ?`,
                        [voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation, mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update VoltageLevel failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: voltageLevel, message: 'Update VoltageLevel completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update VoltageLevel transaction failed' })
                })
        })
    })
}

export const updateVoltageLevelByIdTransaction = async (mrid, voltageLevel, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, voltageLevel, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE voltage_level SET
                        high_voltage_limit = ?,
                        low_voltage_limit = ?,
                        base_voltage = ?,
                        substation = ?
                     WHERE mrid = ?`,
                    [voltageLevel.high_voltage_limit, voltageLevel.low_voltage_limit, voltageLevel.base_voltage, voltageLevel.substation, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update VoltageLevel failed' })
                        }
                        return resolve({ success: true, data: voltageLevel, message: 'Update VoltageLevel completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update VoltageLevel transaction failed' })
            })
    })
}

export const deleteVoltageLevelById = async (mrid) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete Substation (and EquipmentContainer) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete VoltageLevel transaction failed' })
            })
    })
}

export const deleteVoltageLevelByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.get(
            'SELECT high_voltage_limit, low_voltage_limit, base_voltage FROM voltage_level WHERE mrid = ?',
            [mrid],
            function (err, row) {
                if (err) {
                    return reject({ success: false, err, message: 'Get VoltageLevel failed' })
                }

                // Kiểm tra xem entity có tồn tại không
                if (!row) {
                    return reject({ success: false, err: { message: 'Entity not found' }, message: 'VoltageLevel with mrid ' + mrid + ' does not exist' })
                }

                const voltageMrids = []
                if (row.high_voltage_limit) voltageMrids.push(row.high_voltage_limit)
                if (row.low_voltage_limit) voltageMrids.push(row.low_voltage_limit)
                if (row.base_voltage) voltageMrids.push(row.base_voltage)

                const deleteVoltagePromises = voltageMrids.map(voltageMrid => {
                    return new Promise((resolveVolt, rejectVolt) => {
                        dbsql.run('DELETE FROM voltage WHERE mrid = ?', [voltageMrid], function (voltErr) {
                            if (voltErr) {
                                return resolveVolt({ success: true })
                            }
                            return resolveVolt({ success: true })
                        })
                    })
                })

                const proceedWithDelete = () => {
                    // Xóa voltage_level
                    dbsql.run('DELETE FROM voltage_level WHERE mrid = ?', [mrid], function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Delete VoltageLevel failed' })
                        }

                        equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, dbsql)
                            .then(result => {
                                if (!result.success) {
                                    const message = (result.message || '').toLowerCase()
                                    if (message.includes('not found')) {
                                        return resolve({ success: true, message: 'Delete VoltageLevel completed' })
                                    }
                                    return reject({ 
                                        success: false, 
                                        message: 'Delete EquipmentContainer failed', 
                                        err: result.err 
                                    })
                                }
                                return resolve({ success: true, message: 'Delete VoltageLevel (and EquipmentContainer) completed' })
                            })
                            .catch(err => {
                                const errorMsg = err?.err?.message || err?.message || err?.toString() || 'Unknown error'
                                return reject({ 
                                    success: false, 
                                    err: err.err || err,
                                    message: 'Delete VoltageLevel transaction failed: ' + errorMsg
                                })
                            })
                    })
                }
                
                if (deleteVoltagePromises.length === 0) {
                    proceedWithDelete()
                } else {
                    Promise.all(deleteVoltagePromises)
                        .then(() => {
                            proceedWithDelete()
                        })
                        .catch(() => {
                            proceedWithDelete()
                        })
                }
            }
        )
    })
}