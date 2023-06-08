/**
 * Model fields.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'
import { Field } from '../Field/Field.js'
import { FieldBuilder } from '../Field/FieldBuilder.js'

Model.setFields = function () {
    return []
}

Model.fields = function () {
    if (this.isRootModel()) return {}
    if (!this._fields) {
        this._fields = {}
        // this._fields = new Field
        // console.log(this._fields.name('123').min(3).max(10))
        let fields = this.setFields()
        for (let name in fields) {
            let field = fields[name]
            if (field instanceof FieldBuilder) {
                field = new Field(field.export())
            }
            if (field instanceof Field) {
                field.name = name
                this._fields[name] = field
            }
        }
    }
    return this._fields
}

Model.fieldNames = function () {
    return Object.keys(this.fields())
}

Model.field = function (name) {
    return this.fields()[name]
}

Model.eachFields = function (cb, names) {
    if (!names) names = this.fieldNames()
    for (let name of names) {
        let field = this.field(name)
        if (!field) {
            throw new Error(
                `Field "${name}" not registered in model "${this.name}"`
            )
        }
        if (cb.apply(this, [field, name])) return true
    }
    return false
}

// set fields
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
