
import * as parentOrganisationFunc from '../../function/cim/parentOrganization/index.js'
import ParentOrganization from '../../views/Cim/ParentOrganization/index.js'
import db from '../../../electron/db.js'

export const createOrganisationRoot = (dbsql) => {
    return new Promise((resolve, reject) => {
        const parentOrganisation = new ParentOrganization()
        parentOrganisation.mrid = '00000000-0000-0000-0000-000000000000'
        parentOrganisation.name = 'Root'
        const dbInstance = dbsql || db
        dbInstance.serialize(() => {
            dbInstance.run('BEGIN TRANSACTION')
            parentOrganisationFunc.insertParentOrganizationTransaction(parentOrganisation, dbInstance)
                .then(result => {
                    if (!result.success) {
                        dbInstance.run('ROLLBACK')
                        return reject({ success: false, message: 'Create organisation root failed', err: result.err })
                    }
                    dbInstance.run('COMMIT')
                    return resolve({ success: true, data: result.data, message: 'Create organisation root completed' })
                })
                .catch(err => {
                    dbInstance.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Create organisation root transaction failed' })
                })
        })
    })
}