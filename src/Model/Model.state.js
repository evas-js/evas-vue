/**
 * Model state.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'
import { Relation } from '../Relation.js'

Model.prototype.$state = {}

Model.prototype.$saveState = function () {
    this.$state = structuredClone(this)
    logger.methodCall(`${this.$entityName}{${this.$id}}.$saveState`, arguments)
}

/**
 * Откат изменений записи.
 * @param Array|null имена полей и/или связей
 */
Model.prototype.$rollbackChanges = function (names) {
    const cb = field => {this[field.name] = structuredClone(this.$state[field.name])}
    this.constructor.eachFields(cb, names)
    this.constructor.eachRelations(cb, names)
}

Object.defineProperty(Model.prototype, '$isNew', { get: function () {
    return this.$id ? false : true
}})

Object.defineProperty(Model.prototype, '$isDirty', { get: function () {
    return this.$dirtyFields().length > 0
}})

/**
 * Проверка поля на изменённость.
 * @param String|Number имя поля
 * @return Boolean
 */
Model.prototype.$isDirtyField = function (name) {
    let stateValue = this.$state[name]
    if (Array.isArray(stateValue) && Array.isArray(this[name])) {
        return JSON.stringify(stateValue.sort()) !== JSON.stringify(this[name].sort())
    } else if (typeof(stateValue) === 'object' && ![null, undefined].includes(stateValue)) {
        return JSON.stringify(stateValue) !== JSON.stringify(this[name])
    }
    return stateValue !== this[name]
}

/**
 * Проверка связанных записей на изменённость.
 * @param String|Number|Relation имя связи или связь
 * @return Boolean
 */
Model.prototype.$isDirtyRelateds = function (relation) {
    if (!(relation instanceof Relation)) relation = this.relation()[relation]
    let {name, local, foreign, multiple} = relation
    if (multiple) {
        if (Array.isArray(this[name])) {
            let res = false
            let ids = []
            this[name].forEach(related => {
                if (related[foreign]) ids.push(related[foreign])
            })
            if (Array.isArray(this.$state[name])) {
                let idsLocal = []
                this.$state[name].forEach(related => {
                    if (related[foreign]) idsLocal.push(related[foreign])
                })
                res = JSON.stringify(ids.sort()) !== JSON.stringify(idsLocal.sort())
            }
            if (res && Array.isArray(this.$state?.[local])) {
                res = JSON.stringify(ids.sort()) !== JSON.stringify(this.$state?.[local].sort())
            }
            return res
        }
    } else {
        let res = this.$state[name]?.[foreign] !== this[name]?.[foreign]
        if (res) {
            return this.$state?.[local] !== this[name]?.[foreign]
        }
    }
}

/**
 * Получение имён изменённых полей и связанных записей.
 * @param Array|null имена полей и/или связей
 * @return String[]
 */
Model.prototype.$dirtyFields = function (names) {
    let dirty = []
    this.constructor.eachFields((field) => {
        if (this.$isDirtyField(field.name)) dirty.push(field.name)
    }, names)
    this.constructor.eachRelations((relation) => {
        if (this.$isDirtyRelateds(relation)) dirty.push(relation.name)
    }, names)
    return dirty
}

/**
 * @var Object изменённые данные {key: val, ...}
 */
Object.defineProperty(Model.prototype, '$dirtyData', { get: function () {
    let data = {}
    this.$dirtyFields().forEach((name) => (data[name] = this[name]))
    return data
}})
