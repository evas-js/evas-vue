/**
 * Model api.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Api } from '../Api.js'
import { EvasVue } from '../index.js'
import { logger } from '../Log.js'
import { Model } from './Model.js'

Model.api
Model.useApi = true

Model.setApi = function (api) {
    this.api = api instanceof Api ? api : new Api(api)
}

Model.getApiRoute = function (name) {
    if (!this.routes) {
        throw new Error(`${this.entityName} routes does not exists`)
    }
    if (!this.routes[name]) {
        throw new Error(`${this.entityName} not has route ${name}`)
    }
    if (!this.api) {
        throw new Error(
            `Api object does not provide to ${this.entityName} model`
        )
    }
    return this.routes[name]
}

Model.hasApiRoute = function (name) {
    try {
        this.getApiRoute(name)
    } catch (e) {
        console.error(e)
        return false
    }
    return true
}


/**
 * Обработка данных полученных через fetch.
 * @param mixed данные
 * @param Response
 * @param String имя вызванного метода
 * @param Function колбэк
 */
Model.apiDataFetched = function (data, res, name, cb) {
    this.beforeFetched(name, data, res)
    // console.log(name, 'fetched api data:', data)
    if (data) {
        if (data.$data) {
            logger.methodCall(`${this.entityName}.apiDataFetched()`, arguments, () => {
                // logger.line()
                data.$data.forEach((sub) => {
                    let type = sub.type || this.entityName
                    let model = EvasVue.getModel(type)
                    if (!model) {
                        console.error(`Model ${type} not found`)
                        return
                    }
                    this.beforeSubFetched(type, sub)
                    let entities = model.insertOrUpdate(sub.rows, true)
                    if (sub.totalRows) model.totalRows = sub.totalRows
                    if (cb) cb(sub, entities, res)
                    this.afterSubFetched(type, entities)
                })
            })
        } else {
            let entities = this.insertOrUpdate(data, true)
            if (cb) cb(data, entities, res)
            this.afterFetched(name, data, entities, res)
        }
    }
}


// Вызов api-эндпоинта


/**
 * Вызов api-эндпоинта без сохранения разультата.
 * @param Array|String имя эндпоинта
 * @param mixed аргументы вызова
 * @param Function колбэк
 */
Model.callApiRoute = function (name, args, cb) {
    let parts = this.getApiRoute(name)
    return this.api.call(parts, args, (data, res) => cb(data, res))
}

/**
 * Вызов api-эндпоинта с сохранением результатов запроса.
 * @param Array|String имя эндпоинта
 * @param mixed аргументы вызова
 * @param Function колбэк
 */
Model.fetch = function (name, args, cb) {
    if (!this.api) {
        return logger.line(`Api not enabled for model "${this.entityName}"`)
    }
    if (args instanceof Model) args = Object.assign({}, args)
    return this.callApiRoute(
        name, args, (data, res) => this.apiDataFetched(data, res, name, cb)
    )
}


// Вызов CRUD api-эндпоинта.

Model.fetchList = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchList`,
        arguments,
        () => this.fetch('list', args, cb)
    )
}

Model.fetchOne = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchOne`,
        arguments,
        () => this.fetch('one', args, cb)
    )
}

Model.fetchInsert = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchInsert`,
        arguments,
        () => this.fetch('insert', args, cb)
    )
}

Model.fetchUpdate = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchUpdate`,
        arguments,
        () => this.fetch('update', args, cb)
    )
}

Model.fetchDelete = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchDelete`,
        arguments,
        () => this.fetch('delete', args, cb)
    )
}


// Model api hooks

Model.beforeFetched = function () {}
Model.afterFetched = function () {}
Model.beforeSubFetched = function () {}
Model.afterSubFetched = function () {}
