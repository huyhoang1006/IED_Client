// PSR Type Class
export default class PsrType {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.type = null;
        this.category = null;
        this.subCategory = null;
    }

    setMRID(mrid) {
        this.mrid = mrid;
    }

    setName(name) {
        this.name = name;
    }

    setDescription(description) {
        this.description = description;
    }

    setType(type) {
        this.type = type;
    }

    setCategory(category) {
        this.category = category;
    }

    setSubCategory(subCategory) {
        this.subCategory = subCategory;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            type: this.type,
            category: this.category,
            subCategory: this.subCategory
        };
    }

    static fromJSON(data) {
        const entity = new PsrType();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.type = data.type;
        entity.category = data.category;
        entity.subCategory = data.subCategory;
        return entity;
    }
}
