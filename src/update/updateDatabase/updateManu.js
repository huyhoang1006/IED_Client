export const getAllNameDatabase = (db) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_schema WHERE type='table'", [], (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

export const createManufacturer = (db) => {
    return new Promise((resolve, reject) => {
        db.run("CREATE TABLE manufacturer_custom(id text PRIMARY KEY NOT NULL, name text, type text)", [], function(err) {
            if (err) {
                reject(err)
            } else {
                resolve(true)
            }
        })
    })
}


