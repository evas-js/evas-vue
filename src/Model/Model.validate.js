/**
 * Model validate.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'

/** @var Function обработчик ошибок валидации */
Model.validateErrorHandler = null

/**
 * Установка обработчика ошибок валидации.
 * @param Function
 * @return self
 */
Model.setValidateErrorHandler = function (cb) {
    if ('function' !== typeof cb) throw new Error(
        `default validate error handler must be a function, ${typeof cb} given`
    )
    this.validateErrorHandler = cb
    return this
}

/**
 * Обработка ошибки валидации.
 */
Model.handleValidateError = function (field, error) {
    if (this.validateErrorHandler) {
        this.validateErrorHandler(error, field.name)
    } else {
        console.error(field, error)
    }
}

/** @var Array ошибки валидации */
Model.prototype.$errors = []

/**
 * Очистка ошибок крайней валидации.
 */
Model.prototype.$clearErrors = function () {
    this.$errors = []
}

/**
 * Валидация записи.
 */
Model.prototype.$validate = function () {
    return logger.methodCall(`${this.$entityName}{${this.$id}}.$validate`, arguments, () => {
        this.$clearErrors()
        this.constructor.eachFields((field) => {
            if (!field.isValid(this[field.name])) {
                this.constructor.handleValidateError(field, field.error)
                this.$errors.push(field.error)
            }
        }, this.$dirtyFields())
        return this.$errors.length < 1
    })
}

/**
 * Валидация записи/записей.
 */
Model.validate = function (entity) {
    if (Array.isArray(entity)) {
        entity.forEach((_entity) => this.validate(_entity))
    }
    else if (entity && entity instanceof this) {
        return entity.$validate()
    }
    else if (entity && 'object' === typeof entity) {
        return (new this(entity)).$validate()
    }
}
