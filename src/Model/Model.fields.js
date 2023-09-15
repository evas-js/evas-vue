/**
 * Model fields.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'
import { Field } from '../Field/Field.js'
import { FieldBuilder } from '../Field/FieldBuilder.js'
import { FieldsUnion } from '../Field/FieldsUnion.js'

/**
 * Установка полей модели.
 * @return Array
 */
Model.setFields = function () {
    return []
}

/** @var Array поля, отправляемые в любом случае, даже если не менялись */
Model.alwaysSend = null

/**
 * Получение установленных полей модели.
 * @return Object Field by names
 */
Model.fields = function () {
    if (this.isRootModel()) return {}
    if (!this._fields) {
        this._fields = {}
        this._fields = this.buildFields(this.setFields())
    }
    return this._fields
}

/**
 * Вспомогательный метод для установки полей.
 */
Model.buildFields = function (fields, name = null) {
    let resultFields = {}
    for (let key in fields) {
        let field = fields[key]

        if (field instanceof FieldsUnion) {
            field.fields = this.buildFields(field.fields, key)
        }

        if (field instanceof FieldBuilder) {
            field = new Field(field.export())

            if (field.itemOf) {
                if (field.itemOf instanceof FieldBuilder) {
                    field.itemOf = new Field(field.itemOf.export())
                }

                if (field.itemOf instanceof FieldsUnion) {
                    field.itemOf.fields = this.buildFields(field.itemOf.fields, key)
                }

                if (field.itemOf instanceof Field || field.itemOf instanceof FieldsUnion) {
                    field.itemOf.name = name || key
                }
            }
        }

        if (field instanceof Field || field instanceof FieldsUnion) {
            field.name = name || key
            resultFields[key] = field
        }
    }
    return resultFields
}

/**
 * Получение имён полей модели.
 * @return Array
 */
Model.fieldNames = function () {
    return Object.keys(this.fields())
}

/**
 * Получение поля по имени.
 * @param string имя поля
 * @return Field
 */
Model.field = function (name) {
    return this.fields()[name]
}

Model.prototype.$field = function (name) {
    return this.constructor.field(name)
}

/**
 * Получение опций поля.
 * @param string имя поля
 * @return Object
 */
Model.fieldOptions = function (name) {
    let options = this.field(name)?.options
    if (!options) return {}
    if (Array.isArray(options)) {
        let res = {}
        options.forEach(option => {
            res[option] = option
        })
        return res
    }
    if ('object' === typeof options) {
        return { ...options }
    }
}

Model.prototype.$fieldOptions = function (name) {
    return this.constructor.fieldOptions(name)
}

Model.eachFields = function (cb, names) {
    if (!names) names = this.fieldNames()
    for (let name of names) {
        let field = this.field(name)
        if (!field) {
            console.warn(`Field "${name}" not registered in model "${this.name}"`)
            continue
        }
        if (cb.apply(this, [field, name])) return true
    }
    return false
}


// Установка полей

Model.attr = function (_default) {
    return new FieldBuilder({ _default })
}
Model.number = function (_default) {
    return new FieldBuilder({ _default, _type: 'number' })
}
Model.string = function (_default) {
    return new FieldBuilder({ _default, _type: 'string' })
}
Model.boolean = function (_default) {
    return new FieldBuilder({ _default, _type: 'boolean' })
}
Model.array = function (_itemOf, _default) {
    return new FieldBuilder({ _itemOf, _default, _type: 'array' })
}

// set variable fields
Model.anyOf = function (fields) {
    return new FieldsUnion('anyOf', fields)
}

Model.oneOf = function (fields) {
    return new FieldsUnion('oneOf', fields)
}

Model.allOf = function (fields) {
    return new FieldsUnion('allOf', fields)
}
