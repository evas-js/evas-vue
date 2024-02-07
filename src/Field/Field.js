/**
 * Поле.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

// import { FieldBuilder } from './FieldBuilder.js'
import { Fieldable } from './Fieldable.js'

export class Field extends Fieldable {
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

    itemOf

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
     * Геттер массива типа поля.
     * @return Boolean
     */
    get isArrayType() {
        return 'array' === this.type;
    }

    /**
     * @param object|null свойства поля
     */
    constructor(props) {
        super(props)
        setProps(this, props)
    }

    /**
     * Получение значения по умолчанию.
     * @return mixed
     */
    getDefault() {
        return 'function' === typeof this.default ? this.default() : this.default
    }

    /**
     * Конвертация типа значения.
     * @param mixed значение
     * @return mixed значение
     */
    convertType(value) {
        if (!this.required && this.isEmptyValue(value)) return value
        if (this.isArrayType) return Array.isArray(value) ? Array.from(value) : value;
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
     * @param mixed значение
     * @return mixed значение
     */
    convertTypeWithDefault(value) {
        // return this.convertType(value !== undefined ? value : this.getDefault())
        // return this.convertType(![undefined, null].includes(value) ? value : this.getDefault())
        return [undefined, null].includes(value) ? this.getDefault() : this.convertType(value)
    }
}

// раширение поля поддержкой валидации
require('./Field.validate.js')

/**
 * Сборщик поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */
import { FieldableBuilder } from './FieldableBuilder.js'

export class FieldBuilder extends FieldableBuilder {
    /** @var String имя поля */
    _name
    /** @var String лейбл поля */
    _label
    /** @var String тип */
    _type
    /** @var Number минимальное значение или длина */
    _min
    /** @var Number максимальное значение или длина */
    _max
    /** @var String паттерн значения */
    _pattern
    /** @var Object|Array опции значения */
    _options
    /** @var String имя совпадающего поля */
    _same
    /** @var String лейбл совпадающего поля */
    _sameLabel

    _itemOf

    /**
     * @param object|null свойства поля
     */
    constructor(props) {
        super(props)
        setProps(this, props)
    }

    name(value) {
        this._name = value
        return this
    }
    label(value) {
        this._label = value
        return this
    }
    type(value) {
        this._type = value
        return this
    }
    min(value) {
        this._min = value
        return this
    }
    max(value) {
        this._max = value
        return this
    }
    pattern(value) {
        this._pattern = value
        return this
    }
    options(value) {
        if (!value) {
            return console.error('Options not setting')
        }
        if (['string', 'number'].includes(typeof value)) {
            value = arguments
        }
        if (!(Array.isArray(value) || 'object' === typeof value)) {
            return console.error(
                `Options of the field ${this._name} must be an array or an object,`,
                `${typeof value} given`, 
                value
            )
        }
        if (Object.prototype.toString.call(value) === '[object Arguments]') {
            value = Array.from(value)
        }
        this._options = value
        return this
    }
    same(value, label) {
        this._same = value
        if (label) this.sameLabel(label)
        return this
    }
    sameLabel(value) {
        this._sameLabel = value
        return this
    }
}


/**
 * Установка свойств для конструктора.
 * @param object|null свойства поля
 */
function setProps(ctx, props) {
    if (props) {
        if (props instanceof FieldBuilder) {
            props = props.export()
        }
        if ('object' === typeof props && !Array.isArray(props)) for (let key in props) {
            ctx[key] = props[key]
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
