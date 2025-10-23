import db from '../datacontext/index.js'

export const checkUsersExist = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user", (err, rows) => {
            if (err) {
                reject(err)
                return
            }
            resolve(rows ? rows.map(row => ({ ...row })) : [])
        })
    })
}

export const getUser = (user) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user where username = ?", [user.username], (err, row) => {
            if (err) {
                reject(err)
                return
            }
            resolve(row ? { ...row } : null)
        })
    })
}

export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row ? { ...row } : null)
        })
    })
}

export const getAllUser = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users ", (err, rows) => {
            if (err) reject(err)
            resolve(rows ? rows.map(row => ({ ...row })) : [])
        })
    })
}

export const changePass = (user) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users' +
            ' SET password=?' +
            ' WHERE id=?',
            [user.password,
            user.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const checkUserExist = (user) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users where username = ?", [user.username], (err, row) => {
            if (err) reject(err)
            resolve(row !== undefined)
        })
    })
}

export const insertUser = (user) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users(username, password, fullname, gender, email, phonenumber, role) VALUES(?, ?, ?, ?, ?, ?, ?)',
            [user.username, user.password, user.fullname, user.gender, user.email, user.phonenumber, user.role], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const editUserInfo = (user) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users' +
            ' SET password=?, fullname=?, gender=?, email=?, phonenumber=?, role=?' +
            ' WHERE id=?',
            [user.password, user.fullname, user.gender, user.email, user.phonenumber, user.role, user.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        db.get("DELETE FROM users WHERE id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row ? { ...row } : null)
        })
    })
}