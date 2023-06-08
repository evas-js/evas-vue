/**
 * Model store methods.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'
import { ModelsStore } from '../ModelsStore.js'

// map
Object.defineProperty(Model, 'map', { 
    get: function () {
        return ModelsStore.model(this.entityName) 
    }
})

// size, all, each

/**
 * Получение количества загруженных записей.
 * @return Number
 */
Model.size = function () {
    return this.map.size
}

/**
 * Получение всех загруженных записей.
 * @return Model[]
 */
Model.all = function () {
    return Array.from(this.map.values())
}

/**
 * Итеративная обработка загруженных записей.
 * @param Function колбэк обработки
 */
Model.each = function (cb) {
    if (!cb) return
    this.map.forEach((entity) => cb(entity))
}

// total rows
Object.defineProperty(Model, 'totalRows', {
    set: function (value) {
        ModelsStore.setTotalRows(this.entityName, value)
    },
    get: function () {
        return ModelsStore.totalRows(this.entityName)
    }
})
