/**
 * Model CRUD methods.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'

Model._processInsert = function (entity, afterFetch = false) {
    // call api insert
    if (this.useApi && false === afterFetch) {
        this.fetchInsert(entity.$dirtyData)
    }
}

Model._processUpdate = function (entity, afterFetch = false) {
    this.map.set(entity.$id, entity)
    // call api update
    if (this.useApi && false === afterFetch) {
        this.fetchUpdate({ id: this.$id, ...entity.$dirtyData })
    }
}

/**
 * Вставка или обновление записи.
 * @param Model|object запись или данные записи
 * @param Boolean|null это данные после api запроса?
 * @return Model запись
 */
Model.insertOrUpdate = function (entity, afterFetch = false) {
    if (Array.isArray(entity)) {
        return entity.map((_entity) => this.insertOrUpdate(_entity, afterFetch))
    } else if (entity && entity instanceof this) {
        if (entity.$id) this._processUpdate(entity, afterFetch)
        else this._processInsert(entity, afterFetch)

        if (afterFetch) entity.$saveState()
        return entity
    } else if (entity && 'object' === typeof entity) {
        return new this(entity, afterFetch)
    }
}

/**
 * Вставка записи.
 * @param Model|object запись или данные записи
 * @param Boolean|null это данные после api запроса?
 * @return Model запись
 */
Model.insert = function (entity, afterFetch = false) {
    if (Array.isArray(entity)) {
        return entity.map((_entity) => this.insert(_entity, afterFetch))
    } else if (entity && entity instanceof this) {
        if (entity.$id) throw new Error('Empty entity has $id')
        this._processInsert(entity, afterFetch)

        if (afterFetch) entity.$saveState()
        return entity
    } else if (entity && 'object' === typeof entity) {
        return new this(entity, !afterFetch)
    }
}

/**
 * Обновление записи.
 * @param Model|object запись или данные записи
 * @param Boolean|null это данные после api запроса?
 * @return Model запись
 */
Model.update = function (entity, afterFetch = false) {
    if (Array.isArray(entity)) {
        return entity.map((_entity) => this.update(_entity, afterFetch))
    } else if (entity && entity instanceof this) {
        if (!entity.$id) throw new Error('Entity not has $id')
        this._processUpdate(entity, afterFetch)

        if (afterFetch) entity.$saveState()
        return entity
    } else if (entity && 'object' === typeof entity) {
        return new this(entity, !afterFetch)
    }
}

/**
 * Удаление записи.
 * @param Model|object|Number запись или данные записи или id записи
 * @param Function колбэк после удаления
 * @param Boolean|null это данные после api запроса?
 * @return Model запись
 */
Model.delete = function (entity, cb, afterFetch = false) {
    if (Array.isArray(entity)) {
        entity.forEach((_entity) => this.delete(_entity, afterFetch))
    }
    if (entity && entity instanceof this) {
        return this.delete(entity.$id, cb, afterFetch)
    }
    if (entity && 'object' === typeof entity) {
        return (new this(entity)).$delete()
    }
    if (entity && ('number' === typeof entity || 'string' === typeof entity)) {
        this.map.delete(entity)
        if (this.useApi && false === afterFetch) {
            // call api delete
            this.fetchDelete({ id: entity }, cb)
        }
    }
}


// instance mutations

/**
 * Получение данных для сохранения.
 * @return Object $dirtyData + alwaysSend
 */
Object.defineProperty(Model.prototype, '$dataToSave', {
    get: function () {
        let data = { ...this.$dirtyData }
        if (Array.isArray(this.constructor.alwaysSend)) {
            let alwaysSendData = {}
            this.constructor.alwaysSend.forEach(key => alwaysSendData[key] = this[key])
            data = { ...alwaysSendData, ...data }
        }
        if (!this.$isNew) data[this.constructor.primary] = this.$id
        logger.line('$dataToSave:', data)
        return data
    }
})

Model.prototype.$logModelInfo = function () {
    logger.returnGroup(() => {
        logger.keyValue('this.$entityName', this.$entityName)
        logger.keyValue(`this.$id (this.${this.constructor.primary})`, this.$id)
        logger.keyValue('this.$isDirty', this.$isDirty)
        logger.keyValue('this.$isNew', this.$isNew)
        logger.keyValue('this', this)
        logger.keyValue('this.$state', this.$state)
        logger.returnGroup(() => {
            logger.keyValue(`${this.constructor.entityName}.fieldNames()`, this.constructor.fieldNames())
            logger.keyValue(`${this.constructor.entityName}.primary`, this.constructor.primary)
            logger.keyValue(`${this.constructor.entityName}.alwaysSend`, this.constructor.alwaysSend)
            logger.keyValue(`${this.constructor.entityName}.relationNames()`, this.constructor.relationNames())
            logger.keyValue(`${this.constructor.entityName}.useApi`, this.constructor.useApi)
        }, `Model info (${this.constructor.entityName})`, )
    }, 'Entity info')
}

/**
 * Сохранение записи.
 * @param Function колбэк после сохранения
 */
Model.prototype.$save = function (cb) {
    // console.log('$save', this, this.$isDirty, this.$id, this.$isNew, this.constructor.useApi)
    logger.methodCall(`${this.$entityName}{${this.$id}}.$save`, arguments, () => {
        this.$logModelInfo()
        if (!this.$isDirty) {
            logger.line('Nothing to save. End save')
            return 
        }

        if (this.$isNew) {
            this.$beforeInsert()
            if (this.$validate()) {
                if (this.constructor.useApi) this.constructor.fetchInsert(this.$dataToSave, cb)
                else this.$saveState()
                logger.line('Inserted')
                this.$afterInsert()
            }
        } else {
            this.$beforeUpdate()
            if (this.$validate()) {
                if (this.constructor.useApi) this.constructor.fetchUpdate(this.$dataToSave, cb)
                else this.$saveState()
                logger.line('Updated')
                this.$afterUpdate()
            }
        }
        logger.line('End save')
    })
}

/**
 * Удаление записи.
 * @param Function колбэк после удаления
 */
Model.prototype.$delete = function (cb) {
    this.$beforeDelete()
    logger.methodCall(`${this.$entityName}{${this.$id}}.$delete`, arguments, () => {
        this.$logModelInfo()
        if (this.constructor.useApi) this.constructor.delete(this, cb)
        else this.$saveState()
        logger.line('End delete')
    })
    this.$afterDelete()
}

// instance mutation hooks
Model.prototype.$beforeInsert = function () {}
Model.prototype.$afterInsert = function () {}
Model.prototype.$beforeUpdate = function () {}
Model.prototype.$afterUpdate = function () {}
Model.prototype.$beforeDelete = function () {}
Model.prototype.$afterDelete = function () {}

