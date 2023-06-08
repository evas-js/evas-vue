/**
 * Data Models Store.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model/Model.js'
import { reactive } from 'vue'

export class ModelsStoreConstructor {
    map = reactive({})

    model(name) {
        if (!this.map[name]) {
            this.map[name] = new Map
        }
        return this.map[name]
    }


    set(name, entities) {
        let model = this.model(name)
        if (!Array.isArray(entities)) entities = [entities]
        entities.forEach(entity => {
            if (!(entity instanceof Model)) {
                throw new Error('ModelsStore: entity must be instanceof Model')
            }
            model.set(entity.$id, entity)
        })
    }

    delete(name, id) {
        this.model(name).delete(id)
    }

    get(name, id) {
        return this.model(name).get(id)
    }

    _totalRows = reactive({})

    totalRows(name) {
        return this._totalRows[name] || 0
    }

    setTotalRows(name, value) {
        this._totalRows[name] = value
    }
}

export const ModelsStore = new ModelsStoreConstructor
