import db from '../../datacontext/index.js'
import * as connectivityNodeContainerFunc from '../connectivityNodeContainer/index.js'

// Thêm mới EquipmentContainer (gồm cả insert ConnectivityNodeContainer)
export const insertEquipmentContainer = async (equipmentContainer) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            connectivityNodeContainerFunc.insertConnectivityNodeContainerTransaction(equipmentContainer, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert ConnectivityNodeContainer failed', err: result.err })
                    }
                    db.run(
                        `INSERT INTO equipment_container(mrid)
                         VALUES (?)
                         ON CONFLICT(mrid) DO NOTHING`,
                        [equipmentContainer.mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert EquipmentContainer failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: equipmentContainer, message: 'Insert EquipmentContainer completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert EquipmentContainer transaction failed' })
                })
        })
    })
}

// Thêm mới EquipmentContainer trong transaction (cho lớp cha gọi)
export const insertEquipmentContainerTransaction = async (equipmentContainer, dbsql) => {
    return new Promise((resolve, reject) => {
        connectivityNodeContainerFunc.insertConnectivityNodeContainerTransaction(equipmentContainer, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert ConnectivityNodeContainer failed', err: result.err })
                }
                
                // Verify mrid exists in connectivity_node_container before inserting into equipment_container
                // This ensures the foreign key constraint is satisfied
                dbsql.get('SELECT mrid FROM connectivity_node_container WHERE mrid = ?', [equipmentContainer.mrid], (verifyErr, verifyRow) => {
                    if (verifyErr) {
                        return reject({ success: false, err: verifyErr, message: 'Failed to verify ConnectivityNodeContainer exists' })
                    }
                    if (!verifyRow) {
                        return reject({ 
                            success: false, 
                            err: new Error('ConnectivityNodeContainer not found'), 
                            message: `Cannot insert EquipmentContainer: mrid '${equipmentContainer.mrid}' does not exist in connectivity_node_container table` 
                        })
                    }
                    
                    // Now safe to insert into equipment_container
                    dbsql.run(
                        `INSERT INTO equipment_container(mrid)
                         VALUES (?)
                         ON CONFLICT(mrid) DO NOTHING`,
                        [equipmentContainer.mrid],
                        function (err) {
                            if (err) {
                                return reject({ success: false, err, message: 'Insert EquipmentContainer failed' })
                            }
                            return resolve({ success: true, data: equipmentContainer, message: 'Insert EquipmentContainer completed' })
                        }
                    )
                })
            })
            .catch(err => {
                console.error('Insert EquipmentContainer failed:', err)
                return reject({ success: false, err, message: 'Insert EquipmentContainer transaction failed' })
            })
    })
}

// Lấy EquipmentContainer theo mrid (gộp cả cha, trả về data: data)
export const getEquipmentContainerById = async (mrid) => {
    try {
        const cncResult = await connectivityNodeContainerFunc.getConnectivityNodeContainerById(mrid)
        if (!cncResult.success) {
            return { success: false, data: null, message: 'ConnectivityNodeContainer not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM equipment_container WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, data: null, message: 'Get EquipmentContainer failed', err })
                if (!row) return resolve({ success: false, data: null, message: 'EquipmentContainer not found' })
                const data = { ...cncResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get EquipmentContainer completed' })
            })
        })
    } catch (err) {
        return { success: false, data: null, message: 'Get EquipmentContainer failed', err }
    }
}

// Cập nhật EquipmentContainer (gồm cả ConnectivityNodeContainer)
export const updateEquipmentContainerById = async (mrid, equipmentContainer) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            connectivityNodeContainerFunc.updateConnectivityNodeContainerByIdTransaction(mrid, equipmentContainer, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update ConnectivityNodeContainer failed', err: result.err })
                    }
                    db.run(
                        `UPDATE equipment_container SET mrid = ? WHERE mrid = ?`,
                        [equipmentContainer.mrid, mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update EquipmentContainer failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: equipmentContainer, message: 'Update EquipmentContainer completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update EquipmentContainer transaction failed' })
                })
        })
    })
}

// Cập nhật EquipmentContainer trong transaction (cho lớp cha gọi)
export const updateEquipmentContainerByIdTransaction = async (mrid, equipmentContainer, dbsql) => {
    return new Promise((resolve, reject) => {
        connectivityNodeContainerFunc.updateConnectivityNodeContainerByIdTransaction(mrid, equipmentContainer, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update ConnectivityNodeContainer failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE equipment_container SET mrid = ? WHERE mrid = ?`,
                    [equipmentContainer.mrid, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update EquipmentContainer failed' })
                        }
                        return resolve({ success: true, data: equipmentContainer, message: 'Update EquipmentContainer completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update EquipmentContainer transaction failed' })
            })
    })
}

// Xóa EquipmentContainer (gồm cả ConnectivityNodeContainer, dùng cascade)
export const deleteEquipmentContainerById = async (mrid) => {
    return new Promise((resolve, reject) => {
        connectivityNodeContainerFunc.deleteConnectivityNodeContainerByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete ConnectivityNodeContainer failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete EquipmentContainer (and ConnectivityNodeContainer) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete EquipmentContainer transaction failed' })
            })
    })
}

// Xóa EquipmentContainer trong transaction (cho lớp cha gọi)
export const deleteEquipmentContainerByIdTransaction = async (mrid, dbsql) => {
    return connectivityNodeContainerFunc.deleteConnectivityNodeContainerByIdTransaction(mrid, dbsql)
}