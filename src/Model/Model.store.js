/**
 * Расширение модели поддержкой хранилища моделей.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
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

/**
 * Очистка записей модели в хранилище.
 * @return this
 */
Model.clear = function () {
    logger.methodCall(`${this.entityName}.clear`, arguments, () => {
        logger.keyValue(`before ${this.entityName}.size`, this.size())
        this.map.clear()
        logger.keyValue(`after ${this.entityName}.size`, this.size())
    })
    return this
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
