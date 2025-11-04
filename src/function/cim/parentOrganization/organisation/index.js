// File: src/function/cim/organisation/index.js
import db from '../../../../../electron/db.js'
import { v4 as newUuid } from 'uuid';

// Lấy owner theo id (sử dụng thay cho organisation)
export const getOrganisationById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM owner WHERE id = ?", [id], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: `Get owner failed: ${err.message || err}` });
            }
            if (!row) {
                return resolve({ success: false, data: null, message: `Owner with id '${id}' not found. Please ensure owner table exists and has a root record.` });
            }
            return resolve({
                success: true,
                data: row,
                message: 'Get owner completed'
            });
        });
    });
};

// Thêm owner trong transaction
export const insertOrganisationTransaction = (owner, dbsql) => {
    return new Promise((resolve, reject) => {
        const dbInstance = dbsql || db; // Sử dụng dbsql nếu có, không thì dùng db mặc định
        const insertData = [
            owner.id || newUuid(),
            owner.name, owner.user_id, owner.address, owner.city, owner.state, owner.country, owner.phone_no, owner.mode, owner.ref_id, owner.fax, owner.email, owner.name_person, owner.phone1, owner.phone2, owner.fax_contact, owner.email_contact, owner.department, owner.position, owner.comment
        ]

        dbInstance.run(
            `INSERT INTO owner (
                id, name, user_id, address, city, state, country, phone_no, mode, ref_id, fax, email, name_person, phone1, phone2, fax_contact, email_contact, department, position, comment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name, user_id=excluded.user_id, address=excluded.address, city=excluded.city, state=excluded.state, country=excluded.country, phone_no=excluded.phone_no, mode=excluded.mode, ref_id=excluded.ref_id, fax=excluded.fax, email=excluded.email, name_person=excluded.name_person, phone1=excluded.phone1, phone2=excluded.phone2, fax_contact=excluded.fax_contact, email_contact=excluded.email_contact, department=excluded.department, position=excluded.position, comment=excluded.comment`,
            insertData,
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert owner failed' });
                }
                return resolve({ success: true, data: owner, message: 'Insert owner completed' });
            }
        );
    });
};

// Cập nhật owner trong transaction
export const updateOrganisationByIdTransaction = (id, owner, dbsql) => {
    return new Promise((resolve, reject) => {
        const dbInstance = dbsql || db;
        dbInstance.run(
            `UPDATE owner SET
                name = ?, user_id = ?, address = ?, city = ?, state = ?, country = ?, phone_no = ?, mode = ?, ref_id = ?, fax = ?, email = ?, name_person = ?, phone1 = ?, phone2 = ?, fax_contact = ?, email_contact = ?, department = ?, position = ?, comment = ?
            WHERE id = ?`,
            [
                owner.name, owner.user_id, owner.address, owner.city, owner.state, owner.country, owner.phone_no, owner.mode, owner.ref_id, owner.fax, owner.email, owner.name_person, owner.phone1, owner.phone2, owner.fax_contact, owner.email_contact, owner.department, owner.position, owner.comment,
                id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update owner failed' });
                }
                return resolve({ success: true, data: owner, message: 'Update owner completed' });
            }
        );
    });
};

// Xóa owner trong transaction
export const deleteOrganisationByIdTransaction = (id, dbsql) => {
    return new Promise((resolve, reject) => {
        const dbInstance = dbsql || db;
        dbInstance.run("DELETE FROM owner WHERE id = ?", [id], function(err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete owner failed' });
            }
            return resolve({ success: true, message: 'Delete owner completed' });
        });
    });
};