
import * as organisationFunc from '../../function/cim/parentOrganization/organisation/index.js'

export const createOrganisationRoot = async () => {
    try {
        const rootOwner = {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Root',
            user_id: null,
            address: null,
            city: null,
            state: null,
            country: null,
            phone_no: null,
            mode: 'organisation',
            ref_id: null,
            fax: null,
            email: null,
            name_person: null,
            phone1: null,
            phone2: null,
            fax_contact: null,
            email_contact: null,
            department: null,
            position: null,
            comment: null
        }
        
        // Kiểm tra xem root organisation đã tồn tại chưa
        const existing = await organisationFunc.getOrganisationById(rootOwner.id)
        if (existing.success && existing.data) {
            return { success: true, data: existing.data, message: 'Root organisation already exists' }
        }
        
        // Tạo mới nếu chưa tồn tại
        const result = await organisationFunc.insertOrganisationTransaction(rootOwner)
        if (!result.success) {
            return { success: false, message: 'Create organisation root failed', err: result.err }
        }
        return { success: true, data: result.data, message: 'Create organisation root completed' }
    } catch (err) {
        return { success: false, err, message: 'Create organisation root failed' }
    }
}
