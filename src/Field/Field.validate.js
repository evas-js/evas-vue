/**
* Field validation.
* @package evas-vue
* @author Egor Vasyakin <egor@evas-php.com>
* @license CC-BY-4.0
*/

import { Field } from './Field.js'

/** @var array маппинг ошибок */
Field.prototype.errorsMap = {
    required: (ctx) => `Поле "${ctx.labelOrName}" обязательно для заполнения`,
    length: (ctx) => {
        let msg = `Длина поля "${ctx.labelOrName}" должна быть`
        if (ctx.min) msg += ` от ${ctx.min}`
        if (ctx.max) msg += ` до ${ctx.max}`
        return msg + ' символов'
    },
    range: (ctx) => {
        let msg = `Значение поля "${ctx.labelOrName}" должно быть в диапазоне`
        if (ctx.min) msg += ` от ${ctx.min}`
        if (ctx.max) msg += ` до ${ctx.max}`
        return msg
    },
    pattern: (ctx) => `Проверьте правильность поля "${ctx.labelOrName}"`,
    options: (ctx) => `Значение поля "${ctx.labelOrName}" не совпадает с доступными опциями`,
    same: (ctx) => `Значения полей "${ctx.labelOrName}" и "${ctx.sameLabelOrName}" должны совпадать`,
}

/**
 * Установка ошибки.
 * @param string тип ошибки
 * @return bool false
 */
Field.prototype.setError = function (type) {
    this.error = this.errorsMap[type](this)
    return false
}

/**
 * Валидации обязательности значения.
 * @param mixed значение
 * @return bool
 */
Field.prototype.validateRequired = function (value) {
    this.error = null
    this.value = value
    return (this.required && (!value))  ? this.setError('required') : true
}

/**
 * Валидатор длины значение.
 * @param mixed значение
 * @return bool
 */
Field.prototype.validateLength = function (value) {
    return (
        this.isStringType && this.validateRequired(value) && value
        && (
            (this.min && value.length < this.min) 
            || (this.max && value.length > this.max)
        )
    ) ? this.setError('length') : true
}

/**
 * Валидатор числового диапазона значения.
 * @param mixed значение
 * @return bool
 */
Field.prototype.validateRange = function (value) {
    return (
        this.isNumberType && this.validateRequired(value) && value
        && (
            (this.min && value < this.min) 
            || (this.max && value > this.max)
        )
    ) ? this.setError('range') : true
}

/**
 * Валидатор соответствия значения опциям.
 * @param mixed значение
 * @return bool
 */
Field.prototype.validateOptions = function (value) {
    this.validateRequired(value)
    return (this.validateRequired(value) && value && this.options && !this.options[value]) 
    ? this.setError('options') : true
}

/**
 * @todo Валидатор паттерна значения.
 */
Field.prototype.validatePattern = function (value) {
    return (this.validateRequired(value)) || true
}

/**
 * Валидатор совпадения значения с другим полем.
 * @param mixed значение
 * @return bool
 */
Field.prototype.validateSame = function (value, values) {
    return (
        this.same && this.validateRequired(value) && value
        && (!values[this.same] || value !== values[this.same])
    ) ? this.setError('same') : true
}

/**
 * Проверка значения.
 * @return bool
 */
Field.prototype.isValid = function (value, values) {
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
Field.prototype.throwIfNotValid = function (value) {
    if (!this.isValid(value)) {
        console.error(this.options)
        throw new Error(this.error)
    }
}
