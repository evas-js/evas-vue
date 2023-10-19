/**
 * Модель.
 * @package evas-vue-core
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Query } from '../Query.js'

export class Model {
    constructor (data, afterFetch = true) {
        return logger.methodCall(`new ${this.$entityName}`, arguments, () => {
            this.$beforeNew(data, afterFetch)
            if (!data) data = {}
            this.$fill(data)
            if (!afterFetch || this.$id) {
                this.constructor.insertOrUpdate(this, afterFetch)
            }
            return new Proxy(this, this)
        })
    }

    static entityName = null
    static primary = 'id'

    get $entityName() {
        return this.constructor.entityName
    }

    get $entityNameWithId() {
        return `${this.$entityName}{${this.$id}}`
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

/**
 * Заполнение свойств записи.
 * @param Object данные [имя поля/связи => значение]
 */
Model.prototype.$fill = function (data) {
    const id = this.$id || data[this.constructor.primary]
    logger.methodCall(`${this.$entityName}{${id}}.$fill`, arguments, () => {
        this._$fillFields(data)
        this._$fillRelatons(data)
    })
}
/**
 * Заполнение свойств-полей записи.
 * @param Object данные [имя поля/связи => значение]
 */
Model.prototype._$fillFields = function (data) {
    const id = this.$id || data[this.constructor.primary]
    logger.returnGroup(() => {
        this.constructor.eachFields((field) => {
            // конвертируем тип значения
            this[field.name] = field.convertTypeWithDefault(data[field.name])
            logger.keyValue(`${this.$entityName}{${id}}.${field.name}`, this[field.name])
        })
    }, 'fill in the fields')
}
/**
 * Заполнение свойств-связей записи.
 * @param Object данные [имя поля/связи => значение]
 */
Model.prototype._$fillRelatons = function (data) {
    const id = this.$id || data[this.constructor.primary]
    logger.returnGroup(() => {
        this.constructor.eachRelations((field) => {
            if (undefined === data[field.name]) return
            this[field.name] = data[field.name]
            // записываем связанные записи в их модели
            field.foreignModel.insertOrUpdate(data[field.name], true)
            logger.keyValue(`${this.$entityName}{${id}}.${field.name}`, this[field.name])
        })
    }, 'fill in the relations')
}

// Хуки модели
Model.prototype.$beforeNew = function () {}

// Расширения модели
require('./Model.api.js')
require('./Model.crud.js')
require('./Model.fields.js')
require('./Model.fields.display.js')
require('./Model.relations.js')
require('./Model.state.js')
require('./Model.store.js')
require('./Model.validate.js')

// Расширение модели поддержкой запросов к хранилищу
Model.query = function () {
    return new Query(this)
}
Model.find = function (id) {
    const query = this.query()
    if (arguments.length > 1 && !Array.isArray(id)) id = Array.from(arguments)
    const field = this.field(this.primary)
    if (Array.isArray(id)) id = id.map(sub => field.convertType(sub))
    else id = field.convertType(id)
    return Array.isArray(id)
        ? query.whereIn(this.primary, id).get()
        : query.where(this.primary, id).first()
}
