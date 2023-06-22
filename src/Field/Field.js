/**
 * Field.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { FieldBuilder } from './FieldBuilder.js'

export class Field {
    /** @var String имя поля */
    name
    /** @var String лейбл поля */
    label
    /** @var Boolean обязательность значения */
    required = true
    /** @var String тип */
    type
    /** @var Number минимальное значение или длина */
    min = 0
    /** @var Number максимальное значение или длина */
    max
    /** @var String паттерн значения */
    pattern
    /** @var Object|Array опции значения */
    options
    /** @var String имя совпадающего поля */
    same
    /** @var String лейбл совпадающего поля */
    sameLabel
    /** @var mixed значение по умолчанию */
    default
    /** @var mixed значение */
    value
    /** @var String ошибка валидации */
    error
    
    /**
     * Конструктор.
     * @param object|null свойства поля
     */
    constructor(props) {
        if (props) {
            if (props instanceof FieldBuilder) {
                props = props.export()
            }
            if ('object' === typeof props && !Array.isArray(props)) for (let key in props) {
                this[key] = props[key]
            }
            else {
                console.error(
                    'Field props must be an object or an instanceof FieldBuilder,',
                    `${typeof props} given`,
                    props
                )
            }
        }
    }

    /** Геттер лейбла или имени поля. */
    get labelOrName() { return this.label || this.name }

    /** Геттер лейбла или имени совпадающего поля. */
    get sameLabelOrName() { return this.sameLabel || this.same }

    /**
     * Геттер строкового типа поля.
     * @return Boolean
     */
    get isStringType() {
        return 'string' === this.type
    }

    /**
     * Геттер числового типа поля.
     * @return Boolean
     */
    get isNumberType() {
        return ['number', 'int', 'integer', 'float'].includes(this.type)
    }

    /**
     * Геттер булевого типа поля.
     * @return Boolean
     */
    get isBooleanType() {
        return  ['bool', 'boolean'].includes(this.type)
    }

    /**
     * Конвертация типа значения.
     * @param mixed значение
     * @return mixed значение
     */
    convertType(value) {
        if (!this.required && [null, undefined].includes(value)) return null
        if (this.isStringType) return value == null ? '' : String(value)
        if (this.isNumberType) {
            let newValue = Number(value)
            return isNaN(newValue) ? value : newValue
        }
        if (this.isBooleanType) return Boolean(value)
        // throw new Error(`Field "${this._name}" has unknown type: ${this._type}`)
        return value
    }

    /**
     * Получение значения по умолчанию.
     * @return mixed
     */
    getDefault() {
        return 'function' === typeof this.default ? this.default() : this.default
    }
}

require('./Field.validate.js')
