/**
 * Data Model.
 * @package evas-vue-core
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Query } from '../Query.js'

export class Model {
    constructor (data, afterFetch = true) {
        logger.methodCall(`new ${this.$entityName}`, data)
        this.$beforeNew(data, afterFetch)
        if (!data) data = {}
        this.$fill(data)
        if (!afterFetch || this.$id) {
            this.constructor.insertOrUpdate(this, afterFetch)
        }
        return new Proxy(this, this)
    }

    static entityName = null
    static primary = 'id'


    get $entityName() {
        return this.constructor.entityName
    }
}

Model.isRootModel = function () {
    return this.name === 'Model'// || this.entityName === null
}

// Model.entityName = null
// Model.primary = 'id'

// entity $id (value of the primary key)
Object.defineProperty(Model.prototype, '$id', {
    set: function (value) {
        this[this.constructor.primary] = value
    },
    get: function () {
        return this[this.constructor.primary]
    }
})

Model.prototype.$fill = function (data) {
    this.constructor.eachFields((field) => {
        this[field.name] = field.convertType(undefined !== data[field.name]
            ? data[field.name]
            : field.getDefault())
    })
    this.constructor.eachRelations((field) => {
        this[field.name] = undefined !== data[field.name]
            ? data[field.name]
            : field.default
        field.foreignModel.insertOrUpdate(data[field.name], true)
    })
}

// Model hooks
Model.prototype.$beforeNew = function () {}

require('./Model.api.js')
require('./Model.crud.js')
require('./Model.fields.js')
require('./Model.relations.js')
require('./Model.state.js')
require('./Model.store.js')
require('./Model.validate.js')

// Model query
Model.query = function () {
    return new Query(this)
}
Model.find = function (id) {
    let query = this.query()
    // if (arguments.length > 1 && !Array.isArray(id)) id = arguments
    return Array.isArray(id)
        ? query.whereIn(this.primary, id).get()
        : query.where(this.primary, id).first()
}
