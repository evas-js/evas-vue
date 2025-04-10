/**
 * Расширение модели поддержкой валидации.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'
import { Field } from '../Field/Field.js'
import { VariableField } from '../Field/VariableField.js'

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
 * Получение обязательных полей
 * @returns { Object }
 */
Model.requiredFields = function () {
    return Object.fromEntries(
        Object.entries(this.fields())
        .filter(([name, field]) => !!field.required)
    )
}
/**
 * Получение имён обязательных полей
 * @returns { Array }
 */
Model.requiredFieldNames = function () {
    return Object.keys(this.requiredFields())
}

/**
 * Получение имен полей, которые поменялись и показываются.
 */
Model.prototype.$fieldNamesForValidate = function () {
    const dirty = this.$dirtyFields()
    // const rules = this.$applyFieldsDisplayRules()
    const display = this.$displayFields()
    const required = this.constructor.requiredFieldNames()
    logger.keyValue('dirty', dirty)
    logger.keyValue('display', display)
    logger.keyValue('required', required)
    logger.keyValue('this', this)
    logger.keyValue('this.$state', this.$state)
    logger.keyValue('this.$isNew', this.$isNew)
    let fieldNames = this.$isNew 
        ? display.concat(dirty)
        : display.filter(name => required.includes(name) || dirty.includes(name))
    if (Array.isArray(this.constructor.alwaysSend)) {
        logger.keyValue('alwaysSend', this.constructor.alwaysSend)
        fieldNames = fieldNames.concat(this.constructor.alwaysSend)
    }
    // logger.keyValue('fieldNames', fieldNames)

    // const registered = this.constructor.fieldNames()
    // const viewRegistered = this.constructor.viewFieldNames()
    // const diff = registered.filter(fieldName => !viewRegistered.includes(fieldName));
    // fieldNames = fieldNames.concat(diff)
    // logger.keyValue('registered', registered)
    // logger.keyValue('viewRegistered', viewRegistered)
    // logger.keyValue('diff', diff)
    logger.keyValue('fieldNames', fieldNames)
    return fieldNames
}

/**
 * Валидация записи.
 */
Model.prototype.$validate = function (fieldNames = null) {
    return logger.methodCall(`${this.$entityNameWithId}.$validate`, arguments, () => {
        if (!fieldNames) fieldNames = this.$fieldNamesForValidate()
        this.$clearErrors()
        this.constructor.eachFields((field) => {
            if (!(field instanceof VariableField || field instanceof Field)) return
            // console.warn(field.name, this[field.name])

            if (!field.isValid(this[field.name], this)) {
                this.constructor.handleValidateError(field, field.error)
                this.$errors.push(field.error)
            }

            // if (Array.isArray(field.value) && field.itemOf) {
            //     this[field.name] = field.value = field.value.map(item => {
            //         // field.itemOf.name = `${field.name} [${index}]`
            //         if (!field.itemOf.isValid(item, this)) {
            //             this.constructor.handleValidateError(field.itemOf, field.itemOf.error)
            //             this.$errors.push(field.itemOf.error)
            //         }
            //         return field.itemOf.convertType(item)
            //     })
            // }

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
