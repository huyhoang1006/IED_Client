import * as parentOrganisationFunc from '../../function/cim/parentOrganization/index.js'
import ParentOrganization from '../../views/Cim/ParentOrganization/index.js'

export const createOrganisationRoot = (dbsql) => {
    return new Promise((resolve, reject) => {
        if (!dbsql) {
            return reject({ success: false, message: 'Database connection is required', err: new Error('dbsql is undefined') })
        }
        const parentOrganisation = new ParentOrganization()
        parentOrganisation.mrid = '00000000-0000-0000-0000-000000000000'
        parentOrganisation.name = 'Root'
        dbsql.serialize(() => {
            dbsql.run('BEGIN TRANSACTION')
            parentOrganisationFunc.insertParentOrganizationTransaction(parentOrganisation, dbsql)
                .then(result => {
                    if (!result.success) {
                        dbsql.run('ROLLBACK')
                        // Extract the actual error message from nested error objects
                        let errorMessage = 'Create organisation root failed';
                        let actualError = result.err;
                        
                        // Unwrap nested errors
                        while (actualError && actualError.err) {
                            actualError = actualError.err;
                        }
                        
                        if (actualError && actualError.message) {
                            errorMessage = actualError.message;
                        } else if (result.message) {
                            errorMessage = result.message;
                        }
                        
                        return reject({ success: false, message: errorMessage, err: actualError || result.err })
                    }
                    
                    dbsql.run('COMMIT')
                    return resolve({ success: true, data: result.data, message: 'Create organisation root completed' })
                })
                .catch(err => {
                    dbsql.run('ROLLBACK')
                    // Extract the actual error message from nested error objects
                    let errorMessage = 'Create organisation root transaction failed';
                    let actualError = err;
                    
                    // Unwrap nested errors
                    while (actualError && actualError.err) {
                        actualError = actualError.err;
                    }
                    
                    if (actualError && actualError.message) {
                        errorMessage = actualError.message;
                    } else if (err && err.message) {
                        errorMessage = err.message;
                    }
                    
                    return reject({ success: false, err: actualError || err, message: errorMessage })
                })
        })
    })
}
