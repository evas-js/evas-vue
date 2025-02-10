/**
 * Вариативное поле.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Fieldable } from './Fieldable.js'
import { Field } from './Field.js'

export class VariableField extends Fieldable {
    /** @var { String } тип вариативного поля (oneOf, anyOf, allOf) */
    type
    /** @var { FieldableBuilder[]|Fieldable[] } поля */
    fields = []
    /** @var { Array } ошибки валидации */
    errors = []

    /** @var { String|null } первая найденная ошибка */
    get error() {
        return this.errors.find(error => error !== null) || null
    }

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this.setProps(props)
    }

    /**
     * Валидация вариативного поля в зависимости от типа.
     * @param { any } value значение
     * @return { Boolean }
     */
    isValid(value) {
        this.errors = []
        // Валидация вариантов поля
        for (const field of this.fields) {
            field.isValid(value)
            this.errors.push(field.error)
        }
        // Базовая валидация поля
        let entries = ['required', 'min', 'max', 'pattern', 'same', 'sameLabel']
        .map(key => [key, this[key]])
        .filter(([, val]) => ![undefined, null].includes(val))
        if (entries.length > 0) {
            let field = new Field(Object.fromEntries(entries))
            if (!field.isValid(value)) {
                this.errors.pop(field.error)
                return false
            }
        }
        // Возврат результата в зависимости от вариативного типа
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
            this.errors.unshift('there must be one valid field variant')
            return false
        }
        return count === 1 ? true : false
    }


    /**
     * Конвертация типа значения.
     * @param { any } value значение
     * @return { any } значение
     */
    convertType(value) {
        for (const field of this.fields) {
            if (field.isValid(value)) return field.convertTypeWithDefault(value)
        }
        return value
    }
    convertTypeWithDefault(value) {
        return this.convertType(value)
    }
}
