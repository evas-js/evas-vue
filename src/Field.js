/**
 * Field validator.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export const Field = class {
    // static types = {
    //     'string': 'String', 
    //     'boolean': 'Boolean', 'bool': 'Boolean'
    //     'number': 'Number', 'int': 'Number', 'integer': 'Number', 'float': 'Number',
    // }

    /** @var string имя поля */
    _name
    /** @var string лейбл поля */
    _label
    /** @var bool обязательность значения */
    _required = true
    /** @var string тип */
    _type = 'string'
    /** @var number минимальное значение или длина */
    _min = 0
    /** @var number|null максимальное значение или длина */
    _max
    /** @var string|null паттерн значения */
    _pattern
    /** @var object|array|null опции значения */
    _options
    /** @var string|null имя совпадающего поля */
    _same
    /** @var string|null лейбл совпадающего поля */
    _sameLabel
    /** @var mixed значение по умолчанию */
    _default
    /** @var mixed значение */
    _value
    /** @var string|null ошибка валидации */
    _error
    /** @var string|null вид отображения */
    _view
    
    // Сеттеры свойств для полей модели

    name(value) {
        this._name = value
        return this
    }
    label(value) {
        this._label = value
        return this
    }
    required(value) {
        this._required = value
        return this
    }
    nullable() {
        this._required = false
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
        if (!value || !(Array.isArray(value) || 'object' === typeof value)) {
            return console.error('Опции поля должны быть объектом или массивом', value)
        }
        this._view = this._view || 'select'
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
    view(value) {
        this._view = value
        return this
    }


    /** @var array маппинг ошибок */
    errorsMap = {
        required: (ctx) => `Поле "${ctx.labelOrName}" обязательно для заполнения`,
        length: (ctx) => `Длина поля "${ctx.labelOrName}" должна быть от ${ctx._min} до ${ctx._max} символов`,
        range: (ctx) => `Значение поля "${ctx.labelOrName}" должно быть в диапазоне от ${ctx._min} до ${ctx._max}`,
        pattern: (ctx) => `Проверьте правильность поля "${ctx.labelOrName}"`,
        options: (ctx) => `Поле "${ctx.labelOrName}" не совпадает с доступными опциями`,
        same: (ctx) => `Значения полей "${ctx.labelOrName}" и "${ctx.sameLabelOrName}" должны совпадать`,
    }

    /**
     * Конструктор.
     * @param object|null свойства поля
     */
    constructor(props) {
        // if (props) for (let key in props) this[key] = props[key]
        if (props) for (let key in props) {
            let func = this[key]
            if (func) func.call(this, props[key])
        }
    }

    /**
     * Геттер лейбла или имени поля.
     */
    get labelOrName() {
        return this._label || this._name
    }

    /**
     * Геттер лейбла или имени совпадающего поля.
     */
    get sameLabelOrName() {
        return this._sameLabel || this._same
    }

    /**
     * Геттер строкового типа поля.
     * @return bool
     */
    get isStringType() {
        return 'string' === this._type
    }

    /**
     * Геттер числового типа поля.
     * @return bool
     */
    get isNumberType() {
        return ['number', 'int', 'integer', 'float'].includes(this._type)
    }

    /**
     * Геттер булевого типа поля.
     * @return bool
     */
    get isBooleanType() {
        return  ['bool', 'boolean'].includes(this._type)
    }

    /**
     * Установка ошибки.
     * @param string тип ошибки
     * @return bool false
     */
    setError(type) {
        this.error = this.errorsMap[type](this)
        return false
    }

    /**
     * Конвертация типа значения.
     * @param mixed значение
     * @return mixed значение
     */
    convertType(value) {
        if (this.isStringType) return String(value)
        if (this.isNumberType) return Number(value)
        if (this.isBooleanType) return Boolean(value)
        throw new Error(`Field "${this._name}" has unknown type: ${this._type}`)
    }

    /**
     * Валидации обязательности значения.
     * @param mixed значение
     * @return bool
     */
    validateRequired(value) {
        this._error = null
        this._value = value
        return (this._required && (!value))  ? this.setError('required') : true
    }

    /**
     * Валидатор длины значение.
     * @param mixed значение
     * @return bool
     */
    validateLength(value) {
        return (
            this.isStringType && this.validateRequired(value) && value
            && (
                (this._min && value.length < this._min) 
                || (this._max && value.length > this._max)
            )
        ) ? this.setError('length') : true
    }

    /**
     * Валидатор числового диапазона значения.
     * @param mixed значение
     * @return bool
     */
    validateRange(value) {
        return (
            this.isNumberType && this.validateRequired(value) && value
            && (
                (this._min && value < this._min) 
                || (this._max && value > this._max)
            )
        ) ? this.setError('range') : true
    }

    /**
     * Валидатор соответствия значения опциям.
     * @param mixed значение
     * @return bool
     */
    validateOptions(value) {
        this.validateRequired(value)
        return (this.validateRequired(value) && value && this._options && !this._options[value]) 
        ? this.setError('options') : true
    }

    /**
     * @todo Валидатор паттерна значения.
     */
    validatePattern(value) {
        return (this.validateRequired(value)) || true
    }

    /**
     * Валидатор совпадения значения с другим полем.
     * @param mixed значение
     * @return bool
     */
    validateSame(value, values) {
        return (
            this._same && this.validateRequired(value) && value
            && (!values[this._same] || value !== values[this._same])
        ) ? this.setError('same') : true
    }

    /**
     * Проверка значения.
     * @return bool
     */
    isValid(value, values) {
        this.error = null
        value = this.convertType(value)
        return this.validateRequired(value) 
        && this.validateLength(value) 
        && this.validateRange(value) 
        && this.validateOptions(value)
        && this.validatePattern(value)
        && this.validateSame(value, values)
    }

    /**
     * Проверка значения с выбросом исключения.
     * @throws new Error
     */
    throwIfNotValid(value) {
        if (!this.isValid(value)) {
            console.error(this._options)
            throw new Error(this.error)
        }
    }
}
