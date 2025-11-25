import db from '../../datacontext/index.js'

// Thêm mới OrganisationPerson
export const insertOrganisationPerson = async (organisationPerson) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO organisation_person(
                mrid,
                organisation_id,
                person_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                person_id = excluded.person_id`,
            [
                organisationPerson.mrid,
                organisationPerson.organisation_id,
                organisationPerson.person_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisationPerson failed' })
                return resolve({ success: true, data: organisationPerson, message: 'Insert organisationPerson completed' })
            }
        )
    })
}

export const insertOrganisationPersonTransaction = async (organisationPerson, dbsql) => {
    return new Promise((resolve, reject) => {
        // Validate input
        if (!organisationPerson || !organisationPerson.mrid || !organisationPerson.organisation_id || !organisationPerson.person_id) {
            return reject({ 
                success: false, 
                err: new Error('Invalid organisationPerson data: missing required fields'),
                message: `Insert organisationPerson failed: Invalid data - mrid=${organisationPerson?.mrid}, organisation_id=${organisationPerson?.organisation_id}, person_id=${organisationPerson?.person_id}`
            });
        }
        
        dbsql.run(
            `INSERT INTO organisation_person(
                mrid,
                organisation_id,
                person_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(organisation_id, person_id) DO NOTHING`,
            [
                organisationPerson.mrid,
                organisationPerson.organisation_id,
                organisationPerson.person_id
            ],
            function (err) {
                if (err) {
                    // Provide detailed error message
                    const errorMsg = err.message || err.toString() || 'Unknown database error';
                    return reject({ 
                        success: false, 
                        err, 
                        message: `Insert organisationPerson failed: ${errorMsg}. mrid=${organisationPerson.mrid}, organisation_id=${organisationPerson.organisation_id}, person_id=${organisationPerson.person_id}`
                    });
                }
                return resolve({ success: true, data: organisationPerson, message: 'Insert organisationPerson completed' })
            }
        )
    })
}

// Lấy OrganisationPerson theo mrid
export const getOrganisationPersonById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_person WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: row, message: 'Get organisationPerson completed' })
        })
    })
}

export const getOrganisationPersonByOrganisationId = async (organisation_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_person WHERE organisation_id = ?", [organisation_id], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: rows, message: 'Get organisationPerson completed' })
        })
    })
}

export const getOrganisationPersonByOrganisationIdAndPersonId = async (organisation_id, person_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_person WHERE organisation_id = ? AND person_id = ?", [organisation_id, person_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!row) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: row, message: 'Get organisationPerson completed' })
        })
    })
}

export const getOrganisationPersonByPersonId = async (person_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_person WHERE person_id = ?", [person_id], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get organisationPerson failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'OrganisationPerson not found' })
            return resolve({ success: true, data: rows, message: 'Get organisationPerson completed' })
        })
    })
}

// Cập nhật OrganisationPerson theo mrid
export const updateOrganisationPersonById = async (mrid, organisationPerson) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE organisation_person SET
                organisation_id = ?,
                person_id = ?
            WHERE mrid = ?`,
            [
                organisationPerson.organisation_id,
                organisationPerson.person_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update organisationPerson failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'OrganisationPerson not found' })
                return resolve({ success: true, data: organisationPerson, message: 'Update organisationPerson completed' })
            }
        )
    })
}

// Xóa OrganisationPerson theo mrid
export const deleteOrganisationPersonById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM organisation_person WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete organisationPerson failed' })
            if (this.changes === 0) return resolve({ success: false, message: 'OrganisationPerson not found' })
            return resolve({ success: true, message: 'Delete organisationPerson completed' })
        })
    })
}