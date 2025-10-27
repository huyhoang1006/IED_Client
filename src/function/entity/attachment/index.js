import { v4 as newUuid } from 'uuid'
// import db from '../../datacontext/index' // Module has dependency issues
const db = {} // Placeholder

export const getAttachmentByForeignIdAndType = async (id_foreign, type) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM attachment where id_foreign=? and type=?", [id_foreign, type], (err, row) => {
            if (err)  return reject({success: false, err : err, message: 'Get all attachments failed'})
            if (!row) return resolve({ success: false, data: null, message: 'Attachment not found' })
            return resolve({success: true, data: row, message: 'Get all attachments completed'})
        })
    })
}

export const getAttachmentById = async (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM attachment where id=?", [id], (err, row) => {
            if (err) return reject({success: false, err : err, message: 'Get attachment by id failed'})
            if (!row) return resolve({ success: false, data: null, message: 'Attachment not found' })
            return resolve({success: true, data: row, message: 'Get attachment by id completed'})
        })
    })
}

export const updateAttachmentById = async (id, attachment) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE attachment
             SET path = ?, name = ?, type = ?, id_foreign = ?
             WHERE id = ?`,
            [attachment.path, attachment.name, attachment.type, attachment.id_foreign, id],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update attachment failed' })
                return resolve({ success: true, data : attachment, message: 'Update attachment completed' })
            }
        )
    })
}

export const uploadAttachment = async (attachment) => {
    return new Promise((resolve, reject) => {
        const id = attachment.id || newUuid();
        db.run(
            `INSERT INTO attachment (id, id_foreign, type, name)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                 id_foreign = excluded.id_foreign,
                 type = excluded.type,
                 name = excluded.name`,
            [
                id,
                attachment.id_foreign,
                attachment.type,
                attachment.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Upload attachment failed' });
                return resolve({ 
                    success: true, 
                    data: attachment, 
                    message: 'Upload attachment completed' 
                });
            }
        );
    });
};

export const uploadAttachmentTransaction = async (attachment, dbsql) => {
    return new Promise((resolve, reject) => {
        const id = attachment.id || newUuid();
        dbsql.run(
            `INSERT INTO attachment (id, path, id_foreign, type, name)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                 path = excluded.path,
                 id_foreign = excluded.id_foreign,
                 type = excluded.type,
                 name = excluded.name`,
            [
                id,
                attachment.path,
                attachment.id_foreign,
                attachment.type,
                attachment.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Upload attachment failed' });
                return resolve({
                    success: true,
                    data: { ...attachment, id },
                    message: 'Upload attachment completed'
                });
            }
        );
    });
};

export const deleteAttachmentById = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM attachment WHERE id = ?", [id], (err) => {
            if (err) return reject({ success: false, err, message: 'Delete attachment failed' })
            return resolve({ success: true, data: id, message: 'Delete attachment completed' })
        })
    })
}

export const deleteAttachmentByIdTransaction = (id, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM attachment WHERE id = ?", [id], (err) => {
            if (err) return reject({ success: false, err, message: 'Delete attachment failed' })
            return resolve({ success: true, data: id, message: 'Delete attachment completed' })
        })
    })
}
