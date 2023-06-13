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

Model.apiRoute = function (name, args, cb) {
    let parts = this.getApiRoute(name)
    return this.api.call(parts, args, (data, res) => cb(data, res))
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

Model.apiRouteWithSave = function (name, args, cb) {
    if (args instanceof Model) args = Object.assign({}, args)
    return this.apiRoute(name, args, (data, res) => {
        this.beforeFetched(name, data, res)
        // console.log(name, 'fetched api data:', data)
        if (data) {
            if (data.$data) {
                logger.methodCall(`${this.entityName}.apiRouteWithSave() api data fetched`, [data, res], () => {
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
    })
}

Model.fetch = function (name, args, cb) {
    return this.apiRouteWithSave(name, args, cb)
}

Model.fetchList = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchList`,
        arguments,
        () => this.apiRouteWithSave('list', args, cb)
    )
}

Model.fetchOne = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchOne`,
        arguments,
        () => this.apiRouteWithSave('one', args, cb)
    )
}

Model.fetchInsert = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchInsert`,
        arguments,
        () => this.apiRouteWithSave('insert', args, cb)
    )
}

Model.fetchUpdate = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchUpdate`,
        arguments,
        () => this.apiRouteWithSave('update', args, cb)
    )
}

Model.fetchDelete = function (args, cb) {
    return logger.methodCall(
        `${this.entityName}.fetchDelete`,
        arguments,
        () => this.apiRouteWithSave('delete', args, cb)
    )
}

// api hooks
Model.beforeFetched = function () {}
Model.afterFetched = function () {}
Model.beforeSubFetched = function () {}
Model.afterSubFetched = function () {}
