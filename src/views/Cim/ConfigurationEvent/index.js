/* eslint-disable */
// ConfigurationEvent class for tracking changes
export default class ConfigurationEvent {
    constructor() {
        this.mrid = ''
        this.name = ''
        this.effective_date_time = ''
        this.changed_organisation = ''
        this.user_name = ''
        this.modified_by = ''
        this.type = '' // INSERT, UPDATE, DELETE
        this.description = ''
    }
}

