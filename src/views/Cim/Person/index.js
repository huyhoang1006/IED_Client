// Person Class
export default class Person {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.description = null;
        this.firstName = null;
        this.lastName = null;
        this.middleName = null;
        this.title = null;
        this.gender = null;
        this.birthDate = null;
        this.nationality = null;
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

    setFirstName(firstName) {
        this.firstName = firstName;
    }

    setLastName(lastName) {
        this.lastName = lastName;
    }

    setMiddleName(middleName) {
        this.middleName = middleName;
    }

    setTitle(title) {
        this.title = title;
    }

    setGender(gender) {
        this.gender = gender;
    }

    setBirthDate(birthDate) {
        this.birthDate = birthDate;
    }

    setNationality(nationality) {
        this.nationality = nationality;
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            description: this.description,
            firstName: this.firstName,
            lastName: this.lastName,
            middleName: this.middleName,
            title: this.title,
            gender: this.gender,
            birthDate: this.birthDate,
            nationality: this.nationality
        };
    }

    static fromJSON(data) {
        const entity = new Person();
        entity.mrid = data.mrid;
        entity.name = data.name;
        entity.description = data.description;
        entity.firstName = data.firstName;
        entity.lastName = data.lastName;
        entity.middleName = data.middleName;
        entity.title = data.title;
        entity.gender = data.gender;
        entity.birthDate = data.birthDate;
        entity.nationality = data.nationality;
        return entity;
    }
}
