import db from '../../datacontext/index.js'
import * as equipmentContainerFunc from '../equipmentContainer/index.js'

// Thêm mới Substation (gồm cả insert EquipmentContainer)
export const insertSubstation = async (substation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.insertEquipmentContainerTransaction(substation, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `INSERT INTO substation(mrid, generation, industry)
                         VALUES (?, ?, ?)
                         ON CONFLICT(mrid) DO UPDATE SET
                            generation = excluded.generation,
                            industry = excluded.industry`,
                        [substation.mrid, substation.generation, substation.industry],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert Substation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: substation, message: 'Insert Substation completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert Substation transaction failed' })
                })
        })
    })
}

// Thêm mới Substation trong transaction (cho lớp cha gọi)
export const insertSubstationTransaction = async (substation, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.insertEquipmentContainerTransaction(substation, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Insert EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `INSERT INTO substation(mrid, generation, industry)
                     VALUES (?, ?, ?)
                     ON CONFLICT(mrid) DO UPDATE SET
                        generation = excluded.generation,
                        industry = excluded.industry`,
                    [substation.mrid, substation.generation, substation.industry],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert Substation failed' })
                        }
                        return resolve({ success: true, data: substation, message: 'Insert Substation completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert Substation transaction failed' })
            })
    })
}

export const getSubstationsInOrganisationForUser = async (organisationId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            const ROOT_ID = '00000000-0000-0000-0000-000000000000';
            
            // Normalize organisationId - handle undefined, null, empty string, or ROOT_ID
            const normalizedOrgId = (!organisationId || 
                                     organisationId === '' || 
                                     organisationId === ROOT_ID || 
                                     organisationId === '00000000-0000-0000-0000-000000000000') 
                                     ? null : organisationId;
            
            // Normalize userId - treat undefined, null, empty string as null
            const normalizedUserId = (!userId || userId === '' || userId === undefined || userId === null) ? null : userId;
            
            // If userId is null/undefined, load all substations in organisation (without user filter)
            if (!normalizedUserId) {
                // Nếu organisationId là ROOT_ID hoặc null/undefined, query với organisation_id IS NULL
                // Vì organisation_id được normalize thành null khi insert
                let query, params;
                
                if (normalizedOrgId === null) {
                    query = `
                        SELECT 
                            s.*, 
                            io.name AS name
                        FROM substation s
                        JOIN power_system_resource psr ON s.mrid = psr.mrid
                        JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                        JOIN identified_object io ON s.mrid = io.mrid
                        WHERE opsr.organisation_id IS NULL
                    `;
                    params = [];
                } else {
                    query = `
                        SELECT 
                            s.*, 
                            io.name AS name
                        FROM substation s
                        JOIN power_system_resource psr ON s.mrid = psr.mrid
                        JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                        JOIN identified_object io ON s.mrid = io.mrid
                        WHERE opsr.organisation_id = ?
                    `;
                    params = [normalizedOrgId];
                }

                db.all(query, params, (err, rows) => {
                    if (err) {
                        return reject({ success: false, data: null, message: 'Query failed', err });
                    }
                    if (!rows || rows.length === 0) {
                        return resolve({ success: true, data: [], message: 'No substations found in organisation' });
                    }

                    return resolve({
                        success: true,
                        data: rows,
                        message: 'Substations in organisation retrieved'
                    });
                });
            } else {
                // If userId is provided, try to load substations with user filter first
                // If no results, fallback to loading all substations in organisation
                let queryWithUser, paramsWithUser;
                
                if (normalizedOrgId === null) {
                    queryWithUser = `
                        SELECT 
                            s.*, 
                            io.name AS name
                        FROM substation s
                        JOIN power_system_resource psr ON s.mrid = psr.mrid
                        JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                        JOIN user_identified_object uio ON s.mrid = uio.identified_object_id
                        JOIN identified_object io ON s.mrid = io.mrid
                        WHERE opsr.organisation_id IS NULL
                        AND uio.user_id = ?
                    `;
                    paramsWithUser = [normalizedUserId];
                } else {
                    queryWithUser = `
                        SELECT 
                            s.*, 
                            io.name AS name
                        FROM substation s
                        JOIN power_system_resource psr ON s.mrid = psr.mrid
                        JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                        JOIN user_identified_object uio ON s.mrid = uio.identified_object_id
                        JOIN identified_object io ON s.mrid = io.mrid
                        WHERE opsr.organisation_id = ?
                        AND uio.user_id = ?
                    `;
                    paramsWithUser = [normalizedOrgId, normalizedUserId];
                }

                db.all(queryWithUser, paramsWithUser, (err, rows) => {
                    if (err) {
                        return reject({ success: false, data: null, message: 'Query failed', err });
                    }
                    
                    // If found substations with user filter, return them
                    if (rows && rows.length > 0) {
                        return resolve({
                            success: true,
                            data: rows,
                            message: 'Substations in organisation for user retrieved'
                        });
                    }
                    
                    // If no substations found with user filter, try loading all substations in organisation
                    let queryAll, paramsAll;
                    
                    if (normalizedOrgId === null) {
                        queryAll = `
                            SELECT 
                                s.*, 
                                io.name AS name
                            FROM substation s
                            JOIN power_system_resource psr ON s.mrid = psr.mrid
                            JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                            JOIN identified_object io ON s.mrid = io.mrid
                            WHERE opsr.organisation_id IS NULL
                        `;
                        paramsAll = [];
                    } else {
                        queryAll = `
                            SELECT 
                                s.*, 
                                io.name AS name
                            FROM substation s
                            JOIN power_system_resource psr ON s.mrid = psr.mrid
                            JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                            JOIN identified_object io ON s.mrid = io.mrid
                            WHERE opsr.organisation_id = ?
                        `;
                        paramsAll = [normalizedOrgId];
                    }
                    
                    db.all(queryAll, paramsAll, (err2, rows2) => {
                        if (err2) {
                            return reject({ success: false, data: null, message: 'Query failed', err: err2 });
                        }
                        
                        // If still no results, try to find all substations (without organisation filter) to debug
                        if (!rows2 || rows2.length === 0) {
                            const queryAllSubstations = `
                                SELECT 
                                    s.*, 
                                    io.name AS name,
                                    opsr.organisation_id
                                FROM substation s
                                JOIN power_system_resource psr ON s.mrid = psr.mrid
                                LEFT JOIN organisation_psr opsr ON psr.mrid = opsr.psr_id
                                JOIN identified_object io ON s.mrid = io.mrid
                                LIMIT 10
                            `;
                            
                            db.all(queryAllSubstations, [], (err3, rows3) => {
                                if (err3) {
                                    // Silent error handling
                                }
                                
                                return resolve({
                                    success: true,
                                    data: rows2 || [],
                                    message: rows2 && rows2.length > 0 
                                        ? 'Substations in organisation retrieved (no user filter match)' 
                                        : 'No substations found in organisation'
                                });
                            });
                        } else {
                            return resolve({
                                success: true,
                                data: rows2 || [],
                                message: rows2 && rows2.length > 0 
                                    ? 'Substations in organisation retrieved (no user filter match)' 
                                    : 'No substations found in organisation'
                            });
                        }
                    });
                });
            }
        });
    } catch (err) {
        return { success: false, data: null, message: 'Unexpected error', err };
    }
};


// Lấy Substation theo mrid (gộp cả cha, trả về data: data)
export const getSubstationById = async (mrid) => {
    try {
        const ecResult = await equipmentContainerFunc.getEquipmentContainerById(mrid)
        if (!ecResult.success) {
            return { success: false, data: null, message: 'EquipmentContainer not found' }
        }
        return new Promise((resolve, reject) => {
            // JOIN với identified_object để lấy name, alias_name, description
            db.get(`
                SELECT 
                    s.*,
                    io.name,
                    io.alias_name,
                    io.description
                FROM substation s
                LEFT JOIN identified_object io ON s.mrid = io.mrid
                WHERE s.mrid = ?
            `, [mrid], (err, row) => {
                if (err) return reject({ success: false, data: null, message: 'Get Substation failed', err })
                if (!row) return resolve({ success: false, data: null, message: 'Substation not found' })
                // Merge data: ecResult.data đã có identified_object data từ chuỗi gọi, nhưng row từ query có thể có giá trị mới hơn
                // Ưu tiên row từ query nếu có, nếu không thì dùng từ ecResult.data
                const data = { 
                    ...ecResult.data, 
                    ...row,
                    // Đảm bảo name, alias_name, description được lấy từ identified_object
                    name: row.name || ecResult.data?.name || null,
                    alias_name: row.alias_name || ecResult.data?.alias_name || null,
                    description: row.description || ecResult.data?.description || null
                }
                return resolve({ success: true, data: data, message: 'Get Substation completed' })
            })
        })
    } catch (err) {
        return { success: false, data: null, message: 'Get Substation failed', err }
    }
}

// Cập nhật Substation (gồm cả EquipmentContainer)
export const updateSubstationById = async (mrid, substation) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, substation, db)
                .then(result => {
                    if (!result.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                    }
                    db.run(
                        `UPDATE substation SET
                            generation = ?,
                            industry = ?
                         WHERE mrid = ?`,
                        [substation.generation, substation.industry, mrid],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update Substation failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: substation, message: 'Update Substation completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update Substation transaction failed' })
                })
        })
    })
}

// Cập nhật Substation trong transaction (cho lớp cha gọi)
export const updateSubstationByIdTransaction = async (mrid, substation, dbsql) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.updateEquipmentContainerByIdTransaction(mrid, substation, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Update EquipmentContainer failed', err: result.err })
                }
                dbsql.run(
                    `UPDATE substation SET
                        generation = ?,
                        industry = ?
                     WHERE mrid = ?`,
                    [substation.generation, substation.industry, mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update Substation failed' })
                        }
                        return resolve({ success: true, data: substation, message: 'Update Substation completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update Substation transaction failed' })
            })
    })
}

// Xóa Substation (gồm cả EquipmentContainer, dùng cascade)
export const deleteSubstationById = async (mrid) => {
    return new Promise((resolve, reject) => {
        equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete EquipmentContainer failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete Substation (and EquipmentContainer) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete Substation transaction failed' })
            })
    })
}

// Xóa Substation trong transaction (cho lớp cha gọi)
export const deleteSubstationByIdTransaction = async (mrid, dbsql) => {
    return equipmentContainerFunc.deleteEquipmentContainerByIdTransaction(mrid, dbsql)
}