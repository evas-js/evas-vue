/**
* Field validation.
* @package evas-vue
* @author Egor Vasyakin <egor@evas-php.com>
* @license CC-BY-4.0
*/

import { logger } from '../Log.js'
import { EvasVue } from '../index.js'

export function setFieldValidate(field) {
    /**
     * Установка ошибки.
     * @param { String } type тип ошибки
     * @param { Object } additionalCtx дополнительный контекст
     * @return { Boolean } false
     */
    field.prototype.setError = function (type, additionalCtx = {}) {
        const ctx = Object.assign(this, additionalCtx)
        return logger.methodCall(`Field{${this.name}}.setError`, arguments, () => {
            this.error = EvasVue.getValidateError(type, ctx)
            logger.keyValue('error', this.error)
            logger.keyValue('value', this.value)
            return false
        })
    }

    /**
     * Валидация обязательности значения.
     * @param { any } value значение
     * @return { Boolean }
     */
    field.prototype.validateRequired = function (value) {
        this.error = null
        this.value = value
        // return (this.required && this.isEmptyValue(value)) ? this.setError('required') : true
        return !this.required 
        || (Array.isArray(this.value) ? this.value.length : !this.isEmptyValue(value)) 
        || this.setError('required')
    }

    /**
     * Валидация типа значения.
     * @param { any } value значение
     * @return { Boolean }
     */
    field.prototype.validateType = function (value) {
        if (this.isEmptyValue(value) && !this.required) return true
        let expectedType = this.type
        if (!expectedType) {
            // тип не указан
            logger.line(`Не проверяем тип. Field{${this.name}}.type не указан:`, expectedType)
            return true
        }
        if (['number', 'int', 'integer', 'float'].includes(this.type)) {
            expectedType = 'number'
        }
        if (['bool', 'boolean'].includes(this.type)) {
            expectedType = 'boolean'
        }

        if (Array.isArray(value) && expectedType === 'array') {
            return true
        }
        const currentType = typeof value
        if (currentType === expectedType) {
            return true
        }
        // console.log(value, currentType, expectedType)
        return this.setError('type', { currentType, expectedType })
    }

    /**
     * Валидация длины значение.
     * @param { any } value значение
     * @return { Boolean }
     */
    field.prototype.validateLength = function (value) {
        return (
            this.isStringType && this.validateRequired(value) && !this.isEmptyValue(value)
            && (
                (this.min && value.length < this.min) 
                || (this.max && value.length > this.max)
            )
        ) ? this.setError('length') : true
    }

    /**
     * Валидация числового диапазона значения.
     * @param { any } value значение
     * @return { Boolean }
     */
    field.prototype.validateRange = function (value) {
        return (
            this.isNumberType && this.validateRequired(value) && !this.isEmptyValue(value)
            && (
                (this.min && value < this.min) 
                || (this.max && value > this.max)
            )
        ) ? this.setError('range') : true
    }

    /**
     * Валидация соответствия значения опциям.
     * @param { any } value значение
     * @return { Boolean }
     */
    field.prototype.validateOptions = function (value) {
        this.validateRequired(value)
        return (
            this.validateRequired(value) && !this.isEmptyValue(value) && this.options && (
                Array.isArray(this.options) 
                ? -1 === this.options.indexOf(value)
                : !this.options[value]
            )
        )  ? this.setError('options') : true
    }

    /**
     * Валидация паттерна значения.
     * @param { any } value значение
     * @return { Boolean }
     */
    field.prototype.validatePattern = function (value) {
        return (
            this.validateRequired(value) && !this.isEmptyValue(value) && this.pattern && !this.pattern.test(value)
        ) ? this.setError('pattern') : true
    }

    /**
     * Валидация совпадения значения с другим полем.
     * @param { any } value значение текущего поля
     * @param { Object } values значения всех полей по именам
     * @return { Boolean }
     */
    field.prototype.validateSame = function (value, values) {
        return (
            this.same && this.validateRequired(value) && !this.isEmptyValue(value)
            && (!values?.[this.same] || value !== values?.[this.same])
        ) ? this.setError('same') : true
    }

    /**
     * Валидация элементов массива.
     * @param { any } value значение текущего поля
     * @param { Object } values значения всех полей по именам
     * @return { Boolean }
     */
    field.prototype.validateArrayItems = function (value, values) {
        if (this.type !== 'array' || !this.itemOf) return true
        // const handler = this.model.
        for (const item of value) {
            if (!this.itemOf.isValid(item, values)) {
                // this.setError(this.itemOf.error)
                this.error = this.itemOf.error
                return false
            }
        }
        return true
    }

    /**
     * Валидация элементов объекта.
     * @param { any } value значение текущего поля
     * @param { Object } values значения всех полей по именам
     * @return { Boolean }
     */
    field.prototype.validateObjectItems = function (value, values) {
        if (this.type !== 'object' || !this.itemOf) return true
        // const handler = this.model.
        for (const [key, item] of Object.entries(value)) {
            if (!this.itemOf[key].isValid(item, values)) {
                // this.setError(this.itemOf.error)
                this.error = this.itemOf[key].error
                return false
            }
        }
        return true
    }

    /**
     * Проверка значения.
     * @param { any } value значение текущего
     * @param { Object } values значения всех полей по именам
     * @return { Boolean }
     */
    field.prototype.isValid = function (value, values) {
        this.error = null
        value = this.convertType(value)
        return this.validateRequired(value)
        && this.validateType(value)
        && this.validateLength(value) 
        && this.validateRange(value) 
        && this.validateOptions(value)
        && this.validatePattern(value)
        && this.validateSame(value, values)
        && this.validateArrayItems(value, values)
        && this.validateObjectItems(value, values)
    }

    /**
     * Проверка значения с выбросом исключения.
     * @param { any } value значение текущего
     * @param { Object } values значения всех полей по именам
     * @return { Boolean }
     * @throws { Error }
     */
    field.prototype.throwIfNotValid = function (value, values) {
        if (!this.isValid(value, values)) {
            console.error(this.options)
            throw new Error(this.error)
        }
    }
}
