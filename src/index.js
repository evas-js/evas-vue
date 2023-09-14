/**
 * evas-vue plugin initialization.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Api } from './Api.js'
import { logger } from './Log.js'
import { reactive } from 'vue'

export { MockApi } from './MockApi.js'
export { Model } from './Model/Model.js'

export const EvasVue = new function () {
    this.models = reactive({})
    this.api = null
    this.debug = true

    this.install = (app, options) => {
        logger.methodCall('install', [app, options], () => {
            if (options) {
                if (options.api) this.setApi(options.api)
                if (options.models) this.setModels(options.models)
                if (undefined !== options.debug) this.debug = options.debug
            }
            app.config.globalProperties.$models = this.models
            app.config.globalProperties.$api = this.api
        })
    }

    this.setApi = (api) => {
        logger.methodCall('setApi', [api], () => {
            this.api = api instanceof Api ? api : new Api(api)
            if (this.models) Object.values(this.models).forEach(model => {
                model.setApi(this.api)
            })
        })
    }

    this.setModels = (models) => {
        logger.methodCall('setModels', [models], () => {
            Object.entries(models).forEach(([name, model]) => {
                if (this.api) model.setApi(this.api)
                model.entityName = name
                this.models[name] = model
            })
        })
    }

    this.getModel = (modelName) => {
        return this.models[modelName]
    }
}
