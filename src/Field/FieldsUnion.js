/**
 * Variable field.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class FieldsUnion {
    name
    type
    fields
    _required
    errors = []

    constructor(type, fields) {
        this.type = type
        this.fields = fields
    }

    required(value = true) {
        this._required = value
        return this
    }
    nullable(value = false) {
        this._required = value
        return this
    }

    get error() {
        return this.errors.find(error => error !== null) || null
    }

    /**
     * Валидация поля в зависимости от типа.
     * @param value значение
     */
    isValid(value) {
        this.errors = []
        for (let key in this.fields) {
            this.fields[key].isValid(value)
            this.errors.push(this.fields[key].error)
        }
        if (this.type === 'anyOf') return this._anyOfValidate()
        if (this.type === 'allOf') return this._allOfValidate()
        if (this.type === 'oneOf') return this._oneOfValidate()
        return true
    }

    _anyOfValidate() {
        return this.errors.some(error => error === null)
    }

    _allOfValidate() {
        return this.errors.every(error => error === null)
    }

    _oneOfValidate() {
        const count = this.errors.filter(error => error === null).length
        if (count > 1) {
            this.errors.unshift('Ошибка oneOf')
            return false
        }
        return count === 1 ? true : false
    }


    /**
     * Конвертация типа значения.
     * @param mixed значение
     * @return mixed значение
     */
    convertType(value) {
        for (let key in this.fields) {
            if (this.fields[key].isValid(value)) {
                return this.fields[key].convertTypeWithDefault(value)
            }
        }
        return value ?? null
    }


    convertTypeWithDefault(value) {
        return this.convertType(value)
    }
}
