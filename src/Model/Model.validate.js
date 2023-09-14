/**
 * Model validate.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'
import { Field } from '../Field/Field.js'
import { FieldsUnion } from '../Field/FieldsUnion.js'

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
Model.prototype.$validate = function (fieldNames = null) {
    return logger.methodCall(`${this.$entityName}{${this.$id}}.$validate`, arguments, () => {
        if (!fieldNames) {
            const dirty = this.$dirtyFields()
            const viewed = this.$applyFieldsViewRules()
            fieldNames = dirty.filter(fieldName => viewed.includes(fieldName))
            // logger.keyValue('dirty', dirty)
            // logger.keyValue('viewed', viewed)
            // logger.keyValue('fieldNames', fieldNames)
            
            const registered = this.constructor.fieldNames()
            const viewRegistered = this.constructor.viewFieldNames()
            const diff = registered.filter(fieldName => !viewRegistered.includes(fieldName));
            fieldNames = fieldNames.concat(diff)
            // logger.keyValue('registered', registered)
            // logger.keyValue('viewRegistered', viewRegistered)
            // logger.keyValue('diff', diff)
            logger.keyValue('fieldNames', fieldNames)
        }
        this.$clearErrors()
        this.constructor.eachFields((field) => {
            if (!(field instanceof FieldsUnion || field instanceof Field)) return

            if (!field.isValid(this[field.name])) {
                this.constructor.handleValidateError(field, field.error)
                this.$errors.push(field.error)
            }

            if (Array.isArray(field.value) && field.itemOf) {
                this[field.name] = field.value = field.value.map(item => {
                    // field.itemOf.name = `${field.name} [${index}]`
                    if (!field.itemOf.isValid(item)) {
                        this.constructor.handleValidateError(field.itemOf, field.itemOf.error)
                        this.$errors.push(field.itemOf.error)
                    }
                    return field.itemOf.convertType(item)
                })
            }

        }, fieldNames)
        return this.$errors.length < 1
    })
}

/**
 * Валидация записи/записей.
 */
Model.validate = function (entity, fieldNames = null) {
    if (Array.isArray(entity)) {
        entity.forEach((_entity) => this.validate(_entity, fieldNames))
    }
    else if (entity && entity instanceof this) {
        return entity.$validate(fieldNames)
    }
    else if (entity && 'object' === typeof entity) {
        return (new this(entity)).$validate(fieldNames)
    }
    console.warn(
        `${this.entityName}.validate() argument 1`
        + ' must be an object or an array of the objects'
        + `, given:`, entity
    )
    return false
}
