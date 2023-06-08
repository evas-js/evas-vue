/**
 * Model state.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'
import { Relation } from '../Relation.js'

Model.prototype.$state = {}

Model.prototype.$saveState = function () {
    this.$state = structuredClone(this)
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
    if (Array.isArray(stateValue)) {
        return JSON.stringify(stateValue.sort()) !== JSON.stringify(this[name].sort())
    } else if (typeof(stateValue) === 'object' && ![null, undefined].includes(stateValue)) {
        return JSON.stringify(stateValue) !== JSON.stringify(this[name])
    }
    return stateValue !== this[name]
}

/**
 * Проверка связанных записей на изменённость.
 * @param String|Number имя поля
 * @return Boolean
 */
Model.prototype.$isDirtyRelateds = function (name) {
    let relation = name instanceof Relation ? name : this.relation()[name]
    return this.$state[relation.name]?.[relation.foreign] 
    !== this[relation.name]?.[relation.foreign]
}

/**
 * Получение имён изменённых полей и связанных записей.
 * @param Array|null имена полей и/или связей
 * @return String[]
 */
Model.prototype.$dirtyFields = function (names) {
    let dirty = []
    this.constructor.eachFields((field) => {
        if (this.$isDirtyField(field.name)) {
            // console.log(
            //     'cb',
            //     field.name,
            //     this.isDirtyField(field.name),
            //     this.$state[field.name]
            // )
            dirty.push(field.name)
        }
    }, names)
    this.constructor.eachRelations((relation) => {
        // if (this.isDirtyField(relation.name)) {
        if (this.$isDirtyRelateds(relation)) {
            // console.log(
            //     'cb-r',
            //     relation.name,
            //     // this.isDirtyField(relation.name),
            //     // this.$state[relation.name]
            //     relation,
            //     this.$state[relation.name]?.[relation.foreign],
            //     this[relation.name]?.[relation.foreign]
            // )
            dirty.push(relation.name)
        }
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
