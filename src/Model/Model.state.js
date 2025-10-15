/**
 * Расширение модели поддержкой состоянием.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'
import { Relation } from '../Relation.js'

Model.prototype.$state = {}

/**
 * Сохранение состояния записи.
 */
Model.prototype.$saveState = function () {
    this.$state = structuredClone(this)
    delete this.$state.$state
    delete this.$state.$displayGroup
    delete this.$state.$errors
    logger.methodCall(`${this.$entityNameWithId}.$saveState`, arguments)
}

/**
 * Откат изменений записи.
 * @param Array|null имена полей и/или связей
 */
Model.prototype.$rollbackChanges = function (names) {
    const cb = field => (this[field.name] = structuredClone(this.$state[field.name]))
    this.constructor.eachFields(cb, names)
    this.constructor.eachRelations(cb, names)
}


/**
 * @var Boolean Является ли запись новой.
 */
Object.defineProperty(Model.prototype, '$isNew', {
    get: function () {
        return this.$id ? false : true
    },
})

/**
 * @var Boolean Является ли запись "грязной" (с изменёнными, но не сохранёнными данными)
 */
Object.defineProperty(Model.prototype, '$isDirty', {
    get: function () {
        return this.$isDirtyData || this.$isDirtyRelateds
    },
})

/**
 * @var Являются ли "грязными" поля записи (с изменёнными, но не сохранёнными данными)
 */
Object.defineProperty(Model.prototype, '$isDirtyData', {
    get: function () {
        return this.$dirtyFields().length > 0
    },
})

/**
 * @var Boolean Являются ли "грязными" записи связанные с текущей записью (с изменёнными, но не сохранёнными данными)
 */
Object.defineProperty(Model.prototype, '$isDirtyRelateds', {
    get: function () {
        return this.$dirtyRelateds().length > 0
    },
})

/**
 * Проверка поля на изменённость.
 * @param String|Number имя поля
 * @return Boolean
 */
Model.prototype.$isDirtyField = function (name) {
    let stateValue = this.$state[name]
    let value = this[name]
    if (Array.isArray(stateValue) && Array.isArray(value)) {
        return JSON.stringify(stateValue) !== JSON.stringify(value)
    } else if (typeof stateValue === 'object' && ![null, undefined].includes(stateValue)) {
        return JSON.stringify(stateValue) !== JSON.stringify(value)
    } else if ([null, undefined].includes(stateValue) && value === '') {
        return false
    }
    return stateValue !== value
}

/**
 * Проверка связанных записей на изменённость.
 * @param String|Number|Relation имя связи или связь
 * @return Boolean
 */
Model.prototype.$isDirtyRelated = function (relation) {
    if (!(relation instanceof Relation)) relation = this.relation()[relation]
    return [this[relation.name]].flat().some(relalted => relalted.$isDirty)
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
    return dirty
}

/**
 * Получение имён изменённых полей и связанных записей.
 * @param Array|null имена полей и/или связей
 * @return String[]
 */
Model.prototype.$dirtyRelateds = function (names) {
    let dirty = []
    this.constructor.eachRelations(relation => {
        if (this.$isDirtyRelated(relation)) dirty.push(relation.name)
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
