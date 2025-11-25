import db from '../../datacontext/index.js'
import * as equipmentContainerFunc from '../equipmentContainer/index.js'
import * as voltageFunc from '../voltage/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'
import { v4 as newUuid } from 'uuid'


// Thêm mới VoltageLevel (gồm cả insert EquipmentContainer)
export const insertVoltageLevel = async (voltageLevel) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.insertEquipmentContainerTransaction(voltageLevel, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                    }
                    db.run(
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
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert VoltageLevel failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert VoltageLevel transaction failed' })
                })
        })
    })
}

// Thêm mới VoltageLevel trong transaction (cho lớp cha gọi)
export const insertVoltageLevelTransaction = async (voltageLevel, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.insertEquipmentContainerTransaction(voltageLevel, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
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
                        voltageLevel.base_voltage = newUuid()
                    }
                    
                    if (voltageLevel.base_voltage) {
                        insertVoltagePromises.push(
                            new Promise((resolveBaseVoltage, rejectBaseVoltage) => {
                                // Helper to convert multiplier enum to string for display
                                const convertMultiplierToStr = (multiplier) => {
                                    if (!multiplier) return ''
                                    if (typeof multiplier === 'string') return multiplier
                                    const num = Number(multiplier)
                                    if (num === 3) return 'k'
                                    if (num === -3) return 'm'
                                    if (num === 6) return 'M'
                                    if (num === 9) return 'G'
                                    if (num === 12) return 'T'
                                    return multiplier.toString()
                                }
                                
                                // Insert identified_object first
                                const multiplierStr = convertMultiplierToStr(voltageLevel.base_voltage_multiplier)
                                const baseVoltageName = voltageLevel.base_voltage_value 
                                    ? `${voltageLevel.base_voltage_value} ${multiplierStr}${voltageLevel.base_voltage_unit || 'V'}`.trim()
                                    : voltageLevel.base_voltage || 'BaseVoltage'
                                
                                identifiedObjectFunc.insertIdentifiedObjectTransaction({
                                    mrid: voltageLevel.base_voltage,
                                    name: baseVoltageName,
                                    alias_name: null,
                                    description: null
                                }, dbsql)
                                    .then(identifiedResult => {
                                        if (!identifiedResult.success) {
                                            return rejectBaseVoltage({ success: false, message: 'Insert identified_object for base_voltage failed', err: identifiedResult.err })
                                        }
                                        
                                        // Insert into voltage table to store value, multiplier, unit
                                        voltageFunc.insertVoltageTransaction({
                                            mrid: voltageLevel.base_voltage,
                                            value: voltageLevel.base_voltage_value !== null && voltageLevel.base_voltage_value !== undefined ? voltageLevel.base_voltage_value : null,
                                            multiplier: voltageLevel.base_voltage_multiplier || null,
                                            unit: voltageLevel.base_voltage_unit || null
                                        }, dbsql)
                                            .then(voltageResult => {
                                                if (!voltageResult.success) {
                                                    return rejectBaseVoltage({ success: false, message: 'Insert voltage for base_voltage failed', err: voltageResult.err })
                                                }
                                                
                                                // Insert into base_voltage table
                                                dbsql.run(
                                                    `INSERT INTO base_voltage(mrid)
                                                     VALUES (?)
                                                     ON CONFLICT(mrid) DO NOTHING`,
                                                    [voltageLevel.base_voltage],
                                                    function (err) {
                                                        if (err) {
                                                            return rejectBaseVoltage({ success: false, err, message: 'Insert base_voltage failed' })
                                                        }
                                                        return resolveBaseVoltage({ success: true, data: { mrid: voltageLevel.base_voltage }, message: 'Insert base_voltage completed' })
                                                    }
                                                )
                                            })
                                            .catch(err => {
                                                return rejectBaseVoltage({ success: false, err, message: 'Insert voltage for base_voltage failed: ' + (err?.message || 'Unknown error') })
                                            })
                                    })
                                    .catch(err => {
                                        return rejectBaseVoltage({ success: false, err, message: 'Insert base_voltage transaction failed: ' + (err?.message || 'Unknown error') })
                                    })
                            })
                        )
                    }
                }

                // Đợi tất cả voltage insert hoàn thành trước khi insert voltage_level
                if (insertVoltagePromises.length === 0) {
                    // Không có voltage nào cần insert, tiếp tục với voltage_level insert
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
                                if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY')) {
                                    return reject({ success: false, err, message: `Insert VoltageLevel failed: Foreign key constraint failed - ${err.message}. Please ensure all referenced records (voltage for high/low limits, base_voltage for base voltage, substation) exist.` })
                                }
                                return reject({ success: false, err, message: `Insert VoltageLevel failed: ${err.message}` })
                            }
                            return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                        }
                    )
                } else {
                    Promise.all(insertVoltagePromises)
                        .then((results) => {
                            // Kiểm tra kết quả của từng voltage insert
                            if (results && results.length > 0) {
                                const failedInserts = results.filter(r => !r || !r.success)
                                if (failedInserts.length > 0) {
                                    const errorMessages = failedInserts.map(r => {
                                        if (r?.message) return r.message
                                        if (r?.err?.message) return r.err.message
                                        return 'Unknown error'
                                    }).join('; ')
                                    return reject({ 
                                        success: false, 
                                        err: { message: errorMessages },
                                        message: `Insert VoltageLevel failed: One or more voltage inserts failed - ${errorMessages}`
                                    })
                                }
                            }
                            
                            // Validate foreign keys before inserting voltage_level
                            const validateForeignKeys = () => {
                                return new Promise((resolveValidation, rejectValidation) => {
                                    const checks = []
                                    
                                    // Check high_voltage_limit
                                    if (voltageLevel.high_voltage_limit) {
                                        checks.push(
                                            new Promise((resolveCheck) => {
                                                dbsql.get('SELECT mrid FROM voltage WHERE mrid = ?', [voltageLevel.high_voltage_limit], (err, row) => {
                                                    if (err) {
                                                        return resolveCheck({ field: 'high_voltage_limit', exists: false, error: err })
                                                    }
                                                    return resolveCheck({ field: 'high_voltage_limit', exists: !!row })
                                                })
                                            })
                                        )
                                    }
                                    
                                    // Check low_voltage_limit
                                    if (voltageLevel.low_voltage_limit) {
                                        checks.push(
                                            new Promise((resolveCheck) => {
                                                dbsql.get('SELECT mrid FROM voltage WHERE mrid = ?', [voltageLevel.low_voltage_limit], (err, row) => {
                                                    if (err) {
                                                        return resolveCheck({ field: 'low_voltage_limit', exists: false, error: err })
                                                    }
                                                    return resolveCheck({ field: 'low_voltage_limit', exists: !!row })
                                                })
                                            })
                                        )
                                    }
                                    
                                    // Check base_voltage (reference đến bảng base_voltage, không phải voltage)
                                    if (voltageLevel.base_voltage) {
                                        checks.push(
                                            new Promise((resolveCheck) => {
                                                dbsql.get('SELECT mrid FROM base_voltage WHERE mrid = ?', [voltageLevel.base_voltage], (err, row) => {
                                                    if (err) {
                                                        return resolveCheck({ field: 'base_voltage', exists: false, error: err })
                                                    }
                                                    return resolveCheck({ field: 'base_voltage', exists: !!row })
                                                })
                                            })
                                        )
                                    }
                                    
                                    // Check substation (if provided)
                                    if (voltageLevel.substation) {
                                        checks.push(
                                            new Promise((resolveCheck) => {
                                                dbsql.get('SELECT mrid FROM identified_object WHERE mrid = ?', [voltageLevel.substation], (err, row) => {
                                                    if (err) {
                                                        return resolveCheck({ field: 'substation', exists: false, error: err })
                                                    }
                                                    return resolveCheck({ field: 'substation', exists: !!row })
                                                })
                                            })
                                        )
                                    }
                                    
                                    if (checks.length === 0) {
                                        return resolveValidation()
                                    }
                                    
                                    Promise.all(checks).then((results) => {
                                        const missingFields = results.filter(r => !r.exists && r.field)
                                        if (missingFields.length > 0) {
                                            const missingFieldNames = missingFields.map(r => r.field).join(', ')
                                            return rejectValidation({ 
                                                success: false, 
                                                message: `Foreign key validation failed: ${missingFieldNames} do not exist in their respective tables` 
                                            })
                                        }
                                        resolveValidation()
                                    }).catch((err) => {
                                        rejectValidation({ success: false, message: 'Foreign key validation error: ' + (err?.message || 'Unknown error') })
                                    })
                                })
                            }
                            
                            // Validate foreign keys first, then insert
                            validateForeignKeys()
                                .then(() => {
                                    // Check if voltage_level.mrid exists in identified_object (might be a foreign key)
                                    dbsql.get('SELECT mrid FROM identified_object WHERE mrid = ?', [voltageLevel.mrid], (mridCheckErr, mridRow) => {
                                        // Check substation if provided
                                        if (voltageLevel.substation) {
                                            dbsql.get('SELECT mrid FROM identified_object WHERE mrid = ?', [voltageLevel.substation], (subCheckErr, subRow) => {
                                                
                                                // Now insert
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
                                                            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY')) {
                                                                // Check voltage_level table foreign keys
                                                                dbsql.all("PRAGMA foreign_key_list(voltage_level)", (fkListErr, fkList) => {
                                                                    return reject({ 
                                                                        success: false, 
                                                                        err, 
                                                                        message: `Insert VoltageLevel failed: Foreign key constraint failed - ${err.message}. Please ensure all referenced records (identified_object, voltage, substation) exist. mrid: ${voltageLevel.mrid}, substation: ${voltageLevel.substation || 'NULL'}` 
                                                                    })
                                                                })
                                                                return
                                                            }
                                                            return reject({ success: false, err, message: `Insert VoltageLevel failed: ${err.message}` })
                                                        }
                                                        return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                                                    }
                                                )
                                            })
                                        } else {
                                            // substation is NULL, proceed with insert
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
                                                        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY')) {
                                                            // Check voltage_level table foreign keys
                                                            dbsql.all("PRAGMA foreign_key_list(voltage_level)", (fkListErr, fkList) => {
                                                                return reject({ 
                                                                    success: false, 
                                                                    err, 
                                                                    message: `Insert VoltageLevel failed: Foreign key constraint failed - ${err.message}. Please ensure all referenced records (identified_object, voltage, substation) exist. mrid: ${voltageLevel.mrid}, substation: ${voltageLevel.substation || 'NULL'}` 
                                                                })
                                                            })
                                                            return
                                                        }
                                                        return reject({ success: false, err, message: `Insert VoltageLevel failed: ${err.message}` })
                                                    }
                                                    return resolve({ success: true, data: voltageLevel, message: 'Insert VoltageLevel completed' })
                                                }
                                            )
                                        }
                                    })
                                })
                                .catch((validationErr) => {
                                    return reject({ success: false, err: validationErr, message: validationErr.message || 'Foreign key validation failed' })
                                })
                        })
                        .catch((err) => {
                            const errorMsg = err?.message || err?.err?.message || err?.toString() || 'Unknown error'
                            return reject({ 
                                success: false, 
                                err: {
                                    message: err?.message || errorMsg,
                                    errMessage: err?.err?.message || errorMsg
                                },
                                message: `Insert VoltageLevel failed: One or more voltage inserts failed - ${errorMsg}`
                            })
                        })
                }
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert VoltageLevel transaction failed: ' + (err?.message || 'Unknown error') })
            })
    })
}


// Lấy VoltageLevel theo mrid (gộp cả cha, trả về data: data)
export const getVoltageLevelById = async (mrid) => {
    try {
        const ecResult = await equipmentContainerFunc.getEquipmentContainerById(mrid)
        if (!ecResult.success) {
            return { success: false, data: null, message: 'EquipmentContainer not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM voltage_level WHERE mrid = ?", [mrid], async (err, row) => {
                if (err) return reject({ success: false, data: null, message: 'Get VoltageLevel failed', err })
                if (!row) return resolve({ success: false, data: null, message: 'VoltageLevel not found' })
                const data = { ...ecResult.data, ...row }
                
                // Helper function to convert multiplier string from DB to enum number
                const convertMultiplierStringToEnum = (multiplier) => {
                    if (multiplier === null || multiplier === undefined) return null
                    if (typeof multiplier === 'number') return multiplier
                    const strValue = String(multiplier).toLowerCase()
                    if (strValue === 'k') return 3
                    if (strValue === 'm') return -3
                    if (strValue === 'mega' || strValue === 'M') return 6
                    if (strValue === 'g') return 9
                    if (strValue === 't') return 12
                    if (strValue === 'µ' || strValue === 'micro') return -6
                    if (strValue === 'n') return -9
                    if (strValue === 'p') return -12
                    const numValue = Number(multiplier)
                    return !isNaN(numValue) ? numValue : null
                }
                
                // Get high_voltage_limit info from voltage table
                if (row.high_voltage_limit) {
                    db.get("SELECT * FROM voltage WHERE mrid = ?", [row.high_voltage_limit], (highErr, highRow) => {
                        if (!highErr && highRow) {
                            data.high_voltage_limit_value = highRow.value
                            // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                            data.high_voltage_limit_multiplier = convertMultiplierStringToEnum(highRow.multiplier)
                            data.high_voltage_limit_unit = highRow.unit
                        }
                        
                        // Get low_voltage_limit info from voltage table
                        if (row.low_voltage_limit) {
                            db.get("SELECT * FROM voltage WHERE mrid = ?", [row.low_voltage_limit], (lowErr, lowRow) => {
                                if (!lowErr && lowRow) {
                                    data.low_voltage_limit_value = lowRow.value
                                    // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                                    data.low_voltage_limit_multiplier = convertMultiplierStringToEnum(lowRow.multiplier)
                                    data.low_voltage_limit_unit = lowRow.unit
                                }
                                
                                // Get base_voltage info from voltage table and identified_object
                                if (row.base_voltage) {
                                    db.get("SELECT * FROM voltage WHERE mrid = ?", [row.base_voltage], (baseErr, baseRow) => {
                                        if (!baseErr && baseRow) {
                                            data.base_voltage_value = baseRow.value
                                            // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                                            data.base_voltage_multiplier = convertMultiplierStringToEnum(baseRow.multiplier)
                                            data.base_voltage_unit = baseRow.unit
                                        }
                                        
                                        // Also get name from identified_object
                                        db.get("SELECT * FROM identified_object WHERE mrid = ?", [row.base_voltage], (ioErr, ioRow) => {
                                            if (!ioErr && ioRow) {
                                                data.base_voltage_name = ioRow.name || ''
                                            }
                                            return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                                        })
                                    })
                                } else {
                                    return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                                }
                            })
                        } else {
                            // No low_voltage_limit, check base_voltage
                            if (row.base_voltage) {
                                db.get("SELECT * FROM voltage WHERE mrid = ?", [row.base_voltage], (baseErr, baseRow) => {
                                    if (!baseErr && baseRow) {
                                        data.base_voltage_value = baseRow.value
                                        // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                                        data.base_voltage_multiplier = convertMultiplierStringToEnum(baseRow.multiplier)
                                        data.base_voltage_unit = baseRow.unit
                                    }
                                    
                                    db.get("SELECT * FROM identified_object WHERE mrid = ?", [row.base_voltage], (ioErr, ioRow) => {
                                        if (!ioErr && ioRow) {
                                            data.base_voltage_name = ioRow.name || ''
                                        }
                                        return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                                    })
                                })
                            } else {
                                return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                            }
                        }
                    })
                } else {
                    // No high_voltage_limit, check low_voltage_limit
                    if (row.low_voltage_limit) {
                        db.get("SELECT * FROM voltage WHERE mrid = ?", [row.low_voltage_limit], (lowErr, lowRow) => {
                            if (!lowErr && lowRow) {
                                data.low_voltage_limit_value = lowRow.value
                                // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                                data.low_voltage_limit_multiplier = convertMultiplierStringToEnum(lowRow.multiplier)
                                data.low_voltage_limit_unit = lowRow.unit
                            }
                            
                            // Get base_voltage
                            if (row.base_voltage) {
                                db.get("SELECT * FROM voltage WHERE mrid = ?", [row.base_voltage], (baseErr, baseRow) => {
                                    if (!baseErr && baseRow) {
                                        data.base_voltage_value = baseRow.value
                                        // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                                        data.base_voltage_multiplier = convertMultiplierStringToEnum(baseRow.multiplier)
                                        data.base_voltage_unit = baseRow.unit
                                    }
                                    
                                    db.get("SELECT * FROM identified_object WHERE mrid = ?", [row.base_voltage], (ioErr, ioRow) => {
                                        if (!ioErr && ioRow) {
                                            data.base_voltage_name = ioRow.name || ''
                                        }
                                        return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                                    })
                                })
                            } else {
                                return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                            }
                        })
                    } else {
                        // No high or low, check base_voltage only
                        if (row.base_voltage) {
                            db.get("SELECT * FROM voltage WHERE mrid = ?", [row.base_voltage], (baseErr, baseRow) => {
                                if (!baseErr && baseRow) {
                                    data.base_voltage_value = baseRow.value
                                    // Multiplier is stored as string ('k', 'm') in DB - convert to enum for frontend
                                    data.base_voltage_multiplier = convertMultiplierStringToEnum(baseRow.multiplier)
                                    data.base_voltage_unit = baseRow.unit
                                }
                                
                                db.get("SELECT * FROM identified_object WHERE mrid = ?", [row.base_voltage], (ioErr, ioRow) => {
                                    if (!ioErr && ioRow) {
                                        data.base_voltage_name = ioRow.name || ''
                                    }
                                    return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                                })
                            })
                        } else {
                            return resolve({ success: true, data: data, message: 'Get VoltageLevel completed' })
                        }
                    }
                }
            })
        })
    } catch (err) {
        return { success: false, data: null, message: 'Get VoltageLevel failed', err }
    }
}

export const getVoltageLevelsBySubstationId = (substationId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                vl.*, 
                io.*
            FROM voltage_level vl
            JOIN identified_object io ON vl.mrid = io.mrid
            WHERE vl.substation = ?
        `;

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
            updateVoltageLevelByIdTransaction(mrid, voltageLevel, db)
                .then(result => {
                    db.run('COMMIT')
                    return resolve(result)
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
                const updateVoltagePromises = []

                // Update/Insert cả 3 voltage limits cùng lúc (high, low, base)
                if (voltageLevel.high_voltage_limit) {
                    updateVoltagePromises.push(
                        voltageFunc.insertVoltageTransaction({
                            mrid: voltageLevel.high_voltage_limit,
                            value: voltageLevel.high_voltage_limit_value !== null && voltageLevel.high_voltage_limit_value !== undefined ? voltageLevel.high_voltage_limit_value : null,
                            multiplier: voltageLevel.high_voltage_limit_multiplier || null,
                            unit: voltageLevel.high_voltage_limit_unit || null
                        }, dbsql)
                    )
                }

                if (voltageLevel.low_voltage_limit) {
                    updateVoltagePromises.push(
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
                        voltageLevel.base_voltage = newUuid()
                    }
                    
                    if (voltageLevel.base_voltage) {
                        updateVoltagePromises.push(
                            new Promise((resolveBaseVoltage, rejectBaseVoltage) => {
                                // Helper to convert multiplier enum to string for display
                                const convertMultiplierToStr = (multiplier) => {
                                    if (!multiplier) return ''
                                    if (typeof multiplier === 'string') return multiplier
                                    const num = Number(multiplier)
                                    if (num === 3) return 'k'
                                    if (num === -3) return 'm'
                                    if (num === 6) return 'M'
                                    if (num === 9) return 'G'
                                    if (num === 12) return 'T'
                                    return multiplier.toString()
                                }
                                
                                // Insert identified_object first
                                const multiplierStr = convertMultiplierToStr(voltageLevel.base_voltage_multiplier)
                                const baseVoltageName = voltageLevel.base_voltage_value 
                                    ? `${voltageLevel.base_voltage_value} ${multiplierStr}${voltageLevel.base_voltage_unit || 'V'}`.trim()
                                    : voltageLevel.base_voltage || 'BaseVoltage'
                                
                                identifiedObjectFunc.insertIdentifiedObjectTransaction({
                                    mrid: voltageLevel.base_voltage,
                                    name: baseVoltageName,
                                    alias_name: null,
                                    description: null
                                }, dbsql)
                                    .then(identifiedResult => {
                                        if (!identifiedResult.success) {
                                            return rejectBaseVoltage({ success: false, message: 'Insert identified_object for base_voltage failed', err: identifiedResult.err })
                                        }
                                        
                                        // Insert/Update into voltage table to store value, multiplier, unit
                                        voltageFunc.insertVoltageTransaction({
                                            mrid: voltageLevel.base_voltage,
                                            value: voltageLevel.base_voltage_value !== null && voltageLevel.base_voltage_value !== undefined ? voltageLevel.base_voltage_value : null,
                                            multiplier: voltageLevel.base_voltage_multiplier || null,
                                            unit: voltageLevel.base_voltage_unit || null
                                        }, dbsql)
                                            .then(voltageResult => {
                                                if (!voltageResult.success) {
                                                    return rejectBaseVoltage({ success: false, message: 'Insert/Update voltage for base_voltage failed', err: voltageResult.err })
                                                }
                                                
                                                // Insert into base_voltage table
                                                dbsql.run(
                                                    `INSERT INTO base_voltage(mrid)
                                                     VALUES (?)
                                                     ON CONFLICT(mrid) DO NOTHING`,
                                                    [voltageLevel.base_voltage],
                                                    function (err) {
                                                        if (err) {
                                                            return rejectBaseVoltage({ success: false, err, message: 'Insert base_voltage failed' })
                                                        }
                                                        return resolveBaseVoltage({ success: true, data: { mrid: voltageLevel.base_voltage }, message: 'Insert/Update base_voltage completed' })
                                                    }
                                                )
                                            })
                                            .catch(err => {
                                                return rejectBaseVoltage({ success: false, err, message: 'Insert/Update voltage for base_voltage failed: ' + (err?.message || 'Unknown error') })
                                            })
                                    })
                                    .catch(err => {
                                        return rejectBaseVoltage({ success: false, err, message: 'Insert base_voltage transaction failed: ' + (err?.message || 'Unknown error') })
                                    })
                            })
                        )
                    }
                }

                if (updateVoltagePromises.length === 0) {
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
                } else {
                    Promise.all(updateVoltagePromises)
                        .then((results) => {
                            if (results && results.length > 0) {
                                const failedUpdates = results.filter(r => !r || !r.success)
                                if (failedUpdates.length > 0) {
                                    const errorMessages = failedUpdates.map(r => {
                                        if (r?.message) return r.message
                                        if (r?.err?.message) return r.err.message
                                        return 'Unknown error'
                                    }).join('; ')
                                    return reject({ 
                                        success: false, 
                                        err: { message: errorMessages },
                                        message: `Update VoltageLevel failed: One or more voltage updates failed - ${errorMessages}`
                                    })
                                }
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
                        .catch((err) => {
                            const errorMsg = err?.message || err?.err?.message || err?.toString() || 'Unknown error'
                            return reject({ 
                                success: false, 
                                err: {
                                    message: err?.message || errorMsg,
                                    errMessage: err?.err?.message || errorMsg
                                },
                                message: `Update VoltageLevel failed: One or more voltage updates failed - ${errorMsg}`
                            })
                        })
                }
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update VoltageLevel transaction failed' })
            })
    })
}

export const deleteVoltageLevelById = async (mrid) => {
    return new Promise((resolve, reject) => {
        // First get voltage_level to find voltage records to delete
        db.get("SELECT * FROM voltage_level WHERE mrid = ?", [mrid], (err, voltageLevelRow) => {
            if (err) {
                return reject({ success: false, err, message: 'Get VoltageLevel failed before delete: ' + err.message })
            }
            
            if (!voltageLevelRow) {
                return reject({ success: false, message: 'VoltageLevel not found' })
            }
            
            // Delete voltage_level first (this will cascade delete from equipment_container)
            equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, db)
                .then(result => {
                    if (!result.success) {
                        return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                    }
                    
                    // Delete voltage records (high_voltage_limit, low_voltage_limit) if they exist and are not used by other voltage_levels
                    const deleteVoltagePromises = []
                    
                    if (voltageLevelRow.high_voltage_limit) {
                        deleteVoltagePromises.push(
                            new Promise((resolveDelete, rejectDelete) => {
                                // Check if voltage is used by other voltage_levels
                                db.get("SELECT COUNT(*) as count FROM voltage_level WHERE (high_voltage_limit = ? OR low_voltage_limit = ? OR base_voltage = ?) AND mrid != ?", 
                                    [voltageLevelRow.high_voltage_limit, voltageLevelRow.high_voltage_limit, voltageLevelRow.high_voltage_limit, mrid],
                                    (checkErr, checkRow) => {
                                        if (checkErr) {
                                            return rejectDelete({ success: false, err: checkErr, message: 'Check voltage usage failed' })
                                        }
                                        // If not used by any other voltage_level, delete it
                                        if (checkRow.count === 0) {
                                            voltageFunc.deleteVoltageByIdTransaction(voltageLevelRow.high_voltage_limit, db)
                                                .then(() => resolveDelete({ success: true }))
                                                .catch(rejectDelete)
                                        } else {
                                            resolveDelete({ success: true, skipped: true })
                                        }
                                    }
                                )
                            })
                        )
                    }
                    
                    if (voltageLevelRow.low_voltage_limit) {
                        deleteVoltagePromises.push(
                            new Promise((resolveDelete, rejectDelete) => {
                                // Check if voltage is used by other voltage_levels
                                db.get("SELECT COUNT(*) as count FROM voltage_level WHERE (high_voltage_limit = ? OR low_voltage_limit = ? OR base_voltage = ?) AND mrid != ?", 
                                    [voltageLevelRow.low_voltage_limit, voltageLevelRow.low_voltage_limit, voltageLevelRow.low_voltage_limit, mrid],
                                    (checkErr, checkRow) => {
                                        if (checkErr) {
                                            return rejectDelete({ success: false, err: checkErr, message: 'Check voltage usage failed' })
                                        }
                                        // If not used by any other voltage_level, delete it
                                        if (checkRow.count === 0) {
                                            voltageFunc.deleteVoltageByIdTransaction(voltageLevelRow.low_voltage_limit, db)
                                                .then(() => resolveDelete({ success: true }))
                                                .catch(rejectDelete)
                                        } else {
                                            resolveDelete({ success: true, skipped: true })
                                        }
                                    }
                                )
                            })
                        )
                    }
                    
                    if (voltageLevelRow.base_voltage) {
                        deleteVoltagePromises.push(
                            new Promise((resolveDelete, rejectDelete) => {
                                // Check if base_voltage is used by other voltage_levels
                                db.get("SELECT COUNT(*) as count FROM voltage_level WHERE base_voltage = ? AND mrid != ?", 
                                    [voltageLevelRow.base_voltage, mrid],
                                    (checkErr, checkRow) => {
                                        if (checkErr) {
                                            return rejectDelete({ success: false, err: checkErr, message: 'Check base_voltage usage failed' })
                                        }
                                        // If not used by any other voltage_level, delete it
                                        if (checkRow.count === 0) {
                                            // Delete from base_voltage table first (child table)
                                            db.run("DELETE FROM base_voltage WHERE mrid = ?", [voltageLevelRow.base_voltage], (baseErr) => {
                                                if (baseErr) {
                                                    return rejectDelete({ success: false, err: baseErr, message: 'Delete base_voltage failed' })
                                                }
                                                // Then delete from voltage table
                                                voltageFunc.deleteVoltageByIdTransaction(voltageLevelRow.base_voltage, db)
                                                    .then(() => {
                                                        // Finally delete from identified_object table
                                                        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(voltageLevelRow.base_voltage, db)
                                                            .then(() => resolveDelete({ success: true }))
                                                            .catch(rejectDelete)
                                                    })
                                                    .catch(rejectDelete)
                                            })
                                        } else {
                                            resolveDelete({ success: true, skipped: true })
                                        }
                                    }
                                )
                            })
                        )
                    }
                    
                    if (deleteVoltagePromises.length > 0) {
                        Promise.all(deleteVoltagePromises)
                            .then(() => {
                                return resolve({ success: true, message: 'Delete VoltageLevel completed. Related voltage records were cleaned up if not used elsewhere.' })
                            })
                            .catch(deleteErr => {
                                return resolve({ success: true, message: 'Delete VoltageLevel completed, but some voltage cleanup failed: ' + (deleteErr?.message || 'Unknown error') })
                            })
                    } else {
                        return resolve({ success: true, message: 'Delete VoltageLevel completed' })
                    }
                })
                .catch(err => {
                    return reject({ success: false, err, message: 'Delete VoltageLevel transaction failed: ' + (err?.message || 'Unknown error') })
                })
        })
    })
}

export const deleteVoltageLevelByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        // First get voltage_level to find voltage records to delete
        dbsql.get("SELECT * FROM voltage_level WHERE mrid = ?", [mrid], (err, voltageLevelRow) => {
            if (err) {
                return reject({ success: false, err, message: 'Get VoltageLevel failed before delete: ' + err.message })
            }
            
            if (!voltageLevelRow) {
                return reject({ success: false, message: 'VoltageLevel not found' })
            }
            
            // Delete voltage_level first (this will cascade delete from equipment_container)
            equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, dbsql)
                .then(result => {
                    if (!result.success) {
                        return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                    }
                    
                    // Delete voltage records (high_voltage_limit, low_voltage_limit) if they exist and are not used by other voltage_levels
                    const deleteVoltagePromises = []
                    
                    if (voltageLevelRow.high_voltage_limit) {
                        deleteVoltagePromises.push(
                            new Promise((resolveDelete, rejectDelete) => {
                                // Check if voltage is used by other voltage_levels
                                dbsql.get("SELECT COUNT(*) as count FROM voltage_level WHERE (high_voltage_limit = ? OR low_voltage_limit = ? OR base_voltage = ?) AND mrid != ?", 
                                    [voltageLevelRow.high_voltage_limit, voltageLevelRow.high_voltage_limit, voltageLevelRow.high_voltage_limit, mrid],
                                    (checkErr, checkRow) => {
                                        if (checkErr) {
                                            return rejectDelete({ success: false, err: checkErr, message: 'Check voltage usage failed' })
                                        }
                                        // If not used by any other voltage_level, delete it
                                        if (checkRow.count === 0) {
                                            voltageFunc.deleteVoltageByIdTransaction(voltageLevelRow.high_voltage_limit, dbsql)
                                                .then(() => resolveDelete({ success: true }))
                                                .catch(rejectDelete)
                                        } else {
                                            resolveDelete({ success: true, skipped: true })
                                        }
                                    }
                                )
                            })
                        )
                    }
                    
                    if (voltageLevelRow.low_voltage_limit) {
                        deleteVoltagePromises.push(
                            new Promise((resolveDelete, rejectDelete) => {
                                // Check if voltage is used by other voltage_levels
                                dbsql.get("SELECT COUNT(*) as count FROM voltage_level WHERE (high_voltage_limit = ? OR low_voltage_limit = ? OR base_voltage = ?) AND mrid != ?", 
                                    [voltageLevelRow.low_voltage_limit, voltageLevelRow.low_voltage_limit, voltageLevelRow.low_voltage_limit, mrid],
                                    (checkErr, checkRow) => {
                                        if (checkErr) {
                                            return rejectDelete({ success: false, err: checkErr, message: 'Check voltage usage failed' })
                                        }
                                        // If not used by any other voltage_level, delete it
                                        if (checkRow.count === 0) {
                                            voltageFunc.deleteVoltageByIdTransaction(voltageLevelRow.low_voltage_limit, dbsql)
                                                .then(() => resolveDelete({ success: true }))
                                                .catch(rejectDelete)
                                        } else {
                                            resolveDelete({ success: true, skipped: true })
                                        }
                                    }
                                )
                            })
                        )
                    }
                    
                    if (voltageLevelRow.base_voltage) {
                        deleteVoltagePromises.push(
                            new Promise((resolveDelete, rejectDelete) => {
                                dbsql.get("SELECT COUNT(*) as count FROM voltage_level WHERE base_voltage = ? AND mrid != ?", 
                                    [voltageLevelRow.base_voltage, mrid],
                                    (checkErr, checkRow) => {
                                        if (checkErr) {
                                            return rejectDelete({ success: false, err: checkErr, message: 'Check base_voltage usage failed' })
                                        }
                                        // If not used by any other voltage_level, delete it
                                        if (checkRow.count === 0) {
                                            // Delete from base_voltage table first (child table)
                                            dbsql.run("DELETE FROM base_voltage WHERE mrid = ?", [voltageLevelRow.base_voltage], (baseErr) => {
                                                if (baseErr) {
                                                    return rejectDelete({ success: false, err: baseErr, message: 'Delete base_voltage failed' })
                                                }
                                                // Then delete from voltage table
                                                voltageFunc.deleteVoltageByIdTransaction(voltageLevelRow.base_voltage, dbsql)
                                                    .then(() => {
                                                        // Finally delete from identified_object table
                                                        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(voltageLevelRow.base_voltage, dbsql)
                                                            .then(() => resolveDelete({ success: true }))
                                                            .catch(rejectDelete)
                                                    })
                                                    .catch(rejectDelete)
                                            })
                                        } else {
                                            resolveDelete({ success: true, skipped: true })
                                        }
                                    }
                                )
                            })
                        )
                    }
                    
                    if (deleteVoltagePromises.length > 0) {
                        Promise.all(deleteVoltagePromises)
                            .then(() => {
                                return resolve({ success: true, message: 'Delete VoltageLevel completed. Related voltage records were cleaned up if not used elsewhere.' })
                            })
                            .catch(deleteErr => {
                                return resolve({ success: true, message: 'Delete VoltageLevel completed, but some voltage cleanup failed: ' + (deleteErr?.message || 'Unknown error') })
                            })
                    } else {
                        return resolve({ success: true, message: 'Delete VoltageLevel completed' })
                    }
                })
                .catch(err => {
                    return reject({ success: false, err, message: 'Delete VoltageLevel transaction failed: ' + (err?.message || 'Unknown error') })
                })
        })
    })
}