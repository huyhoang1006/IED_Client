import db from '../../datacontext/index.js'
import * as activityRecordFunc from '../activityRecord/index.js'
import constant from '../../../utils/constant.js'

// Helper function to normalize foreign keys in configurationEvent
const normalizeConfigurationEventFk = (event) => {
    const normalizeFk = (value) => {
        if (!value || value === '' || value === constant.ROOT) {
            return null;
        }
        return value;
    };
    
    return {
        ...event,
        power_system_resource: normalizeFk(event.power_system_resource),
        changed_location: normalizeFk(event.changed_location),
        changed_asset: normalizeFk(event.changed_asset),
        changed_organisation_role: normalizeFk(event.changed_organisation_role),
        changed_organisation: normalizeFk(event.changed_organisation),
        changed_person_role: normalizeFk(event.changed_person_role),
        changed_person: normalizeFk(event.changed_person),
        changed_attachment: normalizeFk(event.changed_attachment)
    };
};

// Thêm mới ConfigurationEvent (gồm cả insert activity_record)
export const insertConfigurationEvent = async (event) => {
    // Normalize foreign keys before inserting
    const normalizedEvent = normalizeConfigurationEventFk(event);
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            activityRecordFunc.insertActivityRecordTransaction(normalizedEvent, db)
                .then(activityResult => {
                    if (!activityResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert activity record failed', err: activityResult.err })
                    }
                    db.run(
                        `INSERT INTO configuration_event(
                            mrid, effective_date_time, remark, power_system_resource, changed_location, changed_asset,
                            changed_organisation_role, changed_organisation, changed_person_role, changed_person, changed_attachment, modified_by, user_name
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            effective_date_time = excluded.effective_date_time,
                            remark = excluded.remark,
                            power_system_resource = excluded.power_system_resource,
                            changed_location = excluded.changed_location,
                            changed_asset = excluded.changed_asset,
                            changed_organisation_role = excluded.changed_organisation_role,
                            changed_organisation = excluded.changed_organisation,
                            changed_person_role = excluded.changed_person_role,
                            changed_person = excluded.changed_person,
                            changed_attachment = excluded.changed_attachment,
                            modified_by = excluded.modified_by,
                            user_name = excluded.user_name`,
                        [
                            normalizedEvent.mrid,
                            normalizedEvent.effective_date_time,
                            normalizedEvent.remark,
                            normalizedEvent.power_system_resource,
                            normalizedEvent.changed_location,
                            normalizedEvent.changed_asset,
                            normalizedEvent.changed_organisation_role,
                            normalizedEvent.changed_organisation,
                            normalizedEvent.changed_person_role,
                            normalizedEvent.changed_person,
                            normalizedEvent.changed_attachment,
                            normalizedEvent.modified_by,
                            normalizedEvent.user_name
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert configuration event failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: event, message: 'Insert configuration event completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert configuration event transaction failed' })
                })
        })
    })
}

// Thêm mới ConfigurationEvent trong transaction (cho lớp cha gọi)
export const insertConfigurationEventTransaction = async (event, dbsql) => {
    // Normalize foreign keys before inserting to prevent FK constraint errors
    const normalizedEvent = normalizeConfigurationEventFk(event);
    
    return new Promise((resolve, reject) => {
        activityRecordFunc.insertActivityRecordTransaction(normalizedEvent, dbsql)
            .then(activityResult => {
                if (!activityResult.success) {
                    return reject({ success: false, message: 'Insert activity record failed', err: activityResult.err })
                }
                dbsql.run(
                    `INSERT INTO configuration_event(
                        mrid, effective_date_time, remark, power_system_resource, changed_location, changed_asset,
                        changed_organisation_role, changed_organisation, changed_person_role, changed_person, changed_attachment, modified_by, user_name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        effective_date_time = excluded.effective_date_time,
                        remark = excluded.remark,
                        power_system_resource = excluded.power_system_resource,
                        changed_location = excluded.changed_location,
                        changed_asset = excluded.changed_asset,
                        changed_organisation_role = excluded.changed_organisation_role,
                        changed_organisation = excluded.changed_organisation,
                        changed_person_role = excluded.changed_person_role,
                        changed_person = excluded.changed_person,
                        changed_attachment = excluded.changed_attachment,
                        modified_by = excluded.modified_by,
                        user_name = excluded.user_name`, 
                    [
                        normalizedEvent.mrid,
                        normalizedEvent.effective_date_time,
                        normalizedEvent.remark,
                        normalizedEvent.power_system_resource,
                        normalizedEvent.changed_location,
                        normalizedEvent.changed_asset,
                        normalizedEvent.changed_organisation_role,
                        normalizedEvent.changed_organisation,
                        normalizedEvent.changed_person_role,
                        normalizedEvent.changed_person,
                        normalizedEvent.changed_attachment,
                        normalizedEvent.modified_by,
                        normalizedEvent.user_name
                    ],
                    function (err) {
                        if (err) {
                            console.error('Error inserting configuration event:', err);
                            if (err.code === 'SQLITE_CONSTRAINT' && err.message && err.message.includes('FOREIGN KEY')) {
                                console.error('Configuration Event FK values:', {
                                    power_system_resource: normalizedEvent.power_system_resource,
                                    changed_location: normalizedEvent.changed_location,
                                    changed_asset: normalizedEvent.changed_asset,
                                    changed_organisation_role: normalizedEvent.changed_organisation_role,
                                    changed_organisation: normalizedEvent.changed_organisation,
                                    changed_person_role: normalizedEvent.changed_person_role,
                                    changed_person: normalizedEvent.changed_person,
                                    changed_attachment: normalizedEvent.changed_attachment
                                });
                                return reject({ 
                                    success: false, 
                                    err, 
                                    message: `Insert configuration event failed: Foreign key constraint failed. One of the foreign keys (power_system_resource, changed_location, changed_asset, changed_organisation, changed_person, changed_attachment) references a non-existent record. Error: ${err.message}` 
                                })
                            }
                            return reject({ success: false, err, message: 'Insert configuration event failed' })
                        }
                        return resolve({ success: true, data: event, message: 'Insert configuration event completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert configuration event transaction failed' })
            })
    })
}

export const insertConfigurationEventArrayTransaction = async (eventArray, dbsql) => {
    if (!Array.isArray(eventArray) || eventArray.length === 0) {
        return { success: true, message: 'No configuration events to insert', inserted: 0 };
    }

    try {
        let insertedCount = 0;
        for (const event of eventArray) {
            const result = await insertConfigurationEventTransaction(event, dbsql);
            if (!result.success) {
                throw result.err || new Error('Insert failed');
            }
            insertedCount++;
        }

        return { success: true, inserted: insertedCount, message: 'Inserted configuration events successfully' };
    } catch (err) {
        console.error('Error inserting configuration event array:', err);
        return { success: false, err, message: 'Insert configuration event array failed' };
    }
};


// Lấy ConfigurationEvent theo mrid (gộp cả cha)
export const getConfigurationEventById = async (mrid) => {
    try {
        const activityResult = await activityRecordFunc.getActivityRecordById(mrid)
        if (!activityResult.success) {
            return { success: false, data: null, message: 'Activity record not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM configuration_event WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get configuration event failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Configuration event not found' })
                const data = { ...activityResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get configuration event completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get configuration event failed' }
    }
}

export const getAllConfigurationEvents = async () => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ce.*, 
                    ar.type,
                    ar.created_date_time,
                    io.name,
                    io.description AS description
                FROM configuration_event ce
                JOIN activity_record ar ON ce.mrid = ar.mrid
                JOIN identified_object io ON ar.mrid = io.mrid
            `;

            db.all(query, [], (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get configuration events failed'
                    });
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get configuration events completed'
                });
            });
        });
    } catch (err) {
        return {
            success: false,
            err,
            message: 'Unexpected error when getting configuration events'
        };
    }
}

// Lấy ConfigurationEvent theo changed_organisation
export const getConfigurationEventByChangedOrganisation = async (organisationMrid) => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ce.*, 
                    ar.type,
                    ar.created_date_time,
                    io.name,
                    io.description AS description
                FROM configuration_event ce
                JOIN activity_record ar ON ce.mrid = ar.mrid
                JOIN identified_object io ON ar.mrid = io.mrid
                WHERE ce.changed_organisation = ?
            `;

            db.all(query, [organisationMrid], (err, rows) => {
                if (err) {
                    return reject({
                        success: false,
                        err,
                        message: 'Get configuration events by changed organisation failed'
                    });
                }

                return resolve({
                    success: true,
                    data: rows || [],
                    message: 'Get configuration events by changed organisation completed'
                });
            });
        });
    } catch (err) {
        return {
            success: false,
            err,
            message: 'Unexpected error when getting configuration events by changed organisation'
        };
    }
}


// Cập nhật ConfigurationEvent (gồm cả activity_record)
export const updateConfigurationEventById = async (mrid, event) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            activityRecordFunc.updateActivityRecordByIdTransaction(mrid, event, db)
                .then(activityResult => {
                    if (!activityResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update activity record failed', err: activityResult.err })
                    }
                    db.run(
                        `UPDATE configuration_event SET
                            effective_date_time = ?,
                            remark = ?,
                            power_system_resource = ?,
                            changed_location = ?,
                            changed_asset = ?,
                            changed_organisation_role = ?,
                            changed_organisation = ?,
                            changed_person_role = ?,
                            changed_person = ?,
                            changed_attachment = ?,
                            modified_by = ?,
                            user_name = ?
                         WHERE mrid = ?`,
                        [
                            event.effective_date_time,
                            event.remark,
                            event.power_system_resource,
                            event.changed_location,
                            event.changed_asset,
                            event.changed_organisation_role,
                            event.changed_organisation,
                            event.changed_person_role,
                            event.changed_person,
                            event.changed_attachment,
                            event.modified_by,
                            event.user_name,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update configuration event failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: event, message: 'Update configuration event completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update configuration event transaction failed' })
                })
        })
    })
}

// Cập nhật ConfigurationEvent trong transaction (cho lớp cha gọi)
export const updateConfigurationEventByIdTransaction = async (mrid, event, dbsql) => {
    return new Promise((resolve, reject) => {
        activityRecordFunc.updateActivityRecordByIdTransaction(mrid, event, dbsql)
            .then(activityResult => {
                if (!activityResult.success) {
                    return reject({ success: false, message: 'Update activity record failed', err: activityResult.err })
                }
                dbsql.run(
                    `UPDATE configuration_event SET
                        effective_date_time = ?,
                        remark = ?,
                        power_system_resource = ?,
                        changed_location = ?,
                        changed_asset = ?,
                        changed_organisation_role = ?,
                        changed_organisation = ?,
                        changed_person_role = ?,
                        changed_person = ?,
                        changed_attachment = ?,
                        modified_by = ?,
                        user_name = ?
                     WHERE mrid = ?`,
                    [
                        event.effective_date_time,
                        event.remark,
                        event.power_system_resource,
                        event.changed_location,
                        event.changed_asset,
                        event.changed_organisation_role,
                        event.changed_organisation,
                        event.changed_person_role,
                        event.changed_person,
                        event.changed_attachment,
                        event.modified_by,
                        event.user_name,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update configuration event failed' })
                        }
                        return resolve({ success: true, data: event, message: 'Update configuration event completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update configuration event transaction failed' })
            })
    })
}

// Xóa ConfigurationEvent (gồm cả activity_record, dùng cascade)
export const deleteConfigurationEventById = async (mrid) => {
    return new Promise((resolve, reject) => {
        activityRecordFunc.deleteActivityRecordByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete activity record failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete configuration event (and activity record) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete configuration event transaction failed' })
            })
    })
}

// Xóa ConfigurationEvent trong transaction (cho lớp cha gọi)
export const deleteConfigurationEventByIdTransaction = async (mrid, dbsql) => {
    return activityRecordFunc.deleteActivityRecordByIdTransaction(mrid, dbsql)
}