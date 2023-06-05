/**
 * Model validate.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'

Model.defaultValidateErrorHandler = null
// Model.validateErrorHandlers = {}

Model.setDefaultValidateErrorHandler = function (cb) {
    if ('function' !== typeof cb) throw new Error(
        `default validate error handler must be a function, ${typeof cb} given`
    )
    this.defaultValidateErrorHandler = cb
    return this
}

// Model.setValidateErrorHandler = function (fieldName, cb) {
//     if (!['string', 'number'].includes(typeof fieldName)) throw new Error(
//         `validate error handler field name must a string, ${typeof fieldName} given`
//     )
//     if ('function' !== typeof cb) throw new Error(
//         `validate error handler for field "${fieldName}" must be a function, ${typeof cb} given`
//     )
//     this.validateErrorHandlers[fieldName] = cb
//     return this
// }

Model.handleValidateError = function (field, error) {
    // if (this.validateErrorHandlers[field._name]) {
    //     this.validateErrorHandlers[field._name](error)
    // } else 
    if (this.defaultValidateErrorHandler) {
        this.defaultValidateErrorHandler(error, field._name)
    } else {
        console.error(field, error)
    }
}

Model.prototype.$errors = []

Model.prototype.$validate = function () {
    this.$errors = []
    this.constructor.eachFields((field) => {
        // field.throwIfNotValid(this[field._name])
        if (!field.isValid(this[field._name])) {
            this.constructor.handleValidateError(field, field.error)
            this.$errors.push(field.error)
        }
    }, this.dirtyFields())
    return this.$errors.length < 1
}
