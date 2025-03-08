/**
 * Поле.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

// import { FieldBuilder } from './FieldBuilder.js'
import { Fieldable } from './Fieldable.js'
// раширение поля поддержкой валидации
// require('./Field.validate.js')
import { setFieldValidate } from './Field.validate.js'

export class Field extends Fieldable {
    /** @var { String } тип */
    type
    /** @var { Object|Array } опции значения */
    options
    /** @var { any } значение */
    value
    /** @var { String } ошибка валидации */
    error

    /** @var { Fieldable|Object } вложенное поле для массива или маппинг полей для объекта */
    itemOf

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this.setProps(props)
    }

    /**
     * Строковый ли тип поля.
     * @return Boolean
     */
    get isStringType() {
        return 'string' === this.type
    }

    /**
     * Числовое ли тип поля.
     * @return { Boolean }
     */
    get isNumberType() {
        return ['number', 'int', 'integer', 'float'].includes(this.type)
    }

    /**
     * Булевый ли тип поля.
     * @return { Boolean }
     */
    get isBooleanType() {
        return ['bool', 'boolean'].includes(this.type)
    }

    /**
     * Массив ли тип поля.
     * @return { Boolean }
     */
    get isArrayType() {
        return 'array' === this.type;
    }

    /**
     * Конвертация типа значения.
     * @param { any } значение
     * @return { any } значение
     */
    convertType(value) {
        if (!this.required && this.isEmptyValue(value)) return value
        if (this.isArrayType) return Array.isArray(value) ? value : Array.from(value);
        if (this.isStringType) return value == null ? '' : String(value)
        if (this.isNumberType) {
            let newValue = Number(value)
            return isNaN(newValue) ? value : newValue
        }
        if (this.isBooleanType) return Boolean(value)
        // throw new Error(`Field "${this._name}" has unknown type: ${this._type}`)
        return value;
    }

    /**
     * Подучение значения конвертированного типа или дефолтного значения.
     * @param { any } значение
     * @return { any } значение
     */
    convertTypeWithDefault(value) {
        return [undefined, null].includes(value) ? this.getDefault() : this.convertType(value)
    }
}

setFieldValidate(Field)
