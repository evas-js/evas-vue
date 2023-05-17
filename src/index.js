/**
 * evas-vue plugin initialization.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { reactive } from 'vue'
import { Api } from './Api.js'

export const EvasVueCore = new function () {
    // this.state = reactive({})
    this.models = reactive({})
    this.api = null

    this.install = (app, options) => {
        if (options) {
            if (options.api) this.setApi(options.api)
            if (options.models) this.setModels(options.models)
        }
        // app.config.globalProperties.$state = this.state
        app.config.globalProperties.$models = this.models
        app.config.globalProperties.$api = this.api
    }

    this.setApi = (api) => {
        this.api = api instanceof Api ? api : new Api(api)
        if (this.models) this.setModels(Object.values(this.models))
    }

    this.setModels = (models) => {
        Object.entries(models).forEach(([name, model]) => {
            if (this.api) model.setApi(this.api)
            model.entityName = name
            this.models[name] = model
        })
    }

    this.getModel = (modelName) => {
        return this.models[modelName]
    }
}
