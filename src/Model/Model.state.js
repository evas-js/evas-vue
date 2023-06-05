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
    const cb = field => {this[field._name] = structuredClone(this.$state[field._name])}
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
    return this.$state[relation._name]?.[relation.foreign] 
    !== this[relation._name]?.[relation.foreign]
}

/**
 * Получение имён изменённых полей и связанных записей.
 * @param Array|null имена полей и/или связей
 * @return String[]
 */
Model.prototype.$dirtyFields = function (names) {
    let dirty = []
    this.constructor.eachFields((field) => {
        if (this.$isDirtyField(field._name)) {
            // console.log(
            //     'cb',
            //     field._name,
            //     this.isDirtyField(field._name),
            //     this.$state[field._name]
            // )
            dirty.push(field._name)
        }
    }, names)
    this.constructor.eachRelations((relation) => {
        // if (this.isDirtyField(relation._name)) {
        if (this.$isDirtyRelateds(relation)) {
            // console.log(
            //     'cb-r',
            //     relation._name,
            //     // this.isDirtyField(relation._name),
            //     // this.$state[relation._name]
            //     relation,
            //     this.$state[relation._name]?.[relation.foreign],
            //     this[relation._name]?.[relation.foreign]
            // )
            dirty.push(relation._name)
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
