/**
 * Data Models Store.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

// import { Model } from './Model/Model.js'
import { reactive } from 'vue'

export class ModelsStoreConstructor {
    /** @var Proxy Map'ы по именам моделей */
    map = reactive({})

    /**
     * Получение Map записей модели.
     * @param String имя модели
     * @return Map
     */
    model(name) {
        if (!this.map[name]) {
            this.map[name] = new Map
        }
        return this.map[name]
    }


    // /**
    //  * Добавление записи/записей в Map записей модели.
    //  * @param String имя модели
    //  * @param Model|Array запись или массив записей
    //  * @return this
    //  */
    // set(name, entities) {
    //     let model = this.model(name)
    //     if (!Array.isArray(entities)) entities = [entities]
    //     entities.forEach(entity => {
    //         if (!(entity instanceof Model)) {
    //             throw new Error('ModelsStore: entity must be instanceof Model')
    //         }
    //         model.set(entity.$id, entity)
    //     })
    //     return this
    // }

    // /**
    //  * Удаление записи по id из Map заисей модели.
    //  * @param String имя модели
    //  * @param String|Number id записи
    //  * @return this
    //  */
    // delete(name, id) {
    //     this.model(name).delete(id)
    //     return this
    // }

    // /**
    //  * Получение записи по id из Map записей модели.
    //  * @param String имя модели
    //  * @param String|Number id записи
    //  * @return Model 
    //  */
    // get(name, id) {
    //     return this.model(name).get(id)
    // }

    // /**
    //  * Очистка Map записей модели.
    //  * @param String имя модели
    //  * @return this
    //  */
    // clear(name) {
    //     this.model(name).clear()
    //     return this
    // }


    /** @var Proxy totalRows'ы по именам модели */
    _totalRows = reactive({})

    /**
     * Получение totalRows модели.
     * @param String имя модели
     * @return Number
     */
    totalRows(name) {
        return this._totalRows[name] || 0
    }

    /**
     * Установка totalRows модели.
     * @param String имя модели
     * @param Number totalRows
     * @return this
     */
    setTotalRows(name, value) {
        this._totalRows[name] = value
        return this
    }
}

export const ModelsStore = new ModelsStoreConstructor
