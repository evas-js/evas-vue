/**
 * evas-vue plugin initialization.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Api } from './Api.js'
import { logger } from './Log.js'
import { reactive } from 'vue'

import { 
    ValidateErrorTemplator, defaultValidateErrorSettings 
} from './Field/ValidateErrorTemplator.js'

export { Model } from './Model/Model.js'
export { MockApi } from './MockApi.js'

export { Field } from './Field/Field.js'
export { VariableField } from './Field/VariableField.js'
export { Group, Block, Tabs, Tab, Addon } from './Model/FieldGrouping.js'

export const EvasVue = new function () {
    this.models = reactive({})
    this.api = null
    this.debug = true
    this.validateErrorTemplator

    this.install = (app, options) => {
        logger.methodCall('install', [app, options], () => {
            if (options) {
                if (options.api) this.setApi(options.api)
                if (options.models) this.setModels(options.models)
                if (undefined !== options.debug) this.debug = options.debug
                this.setValidateOptions(options.validate)
            }
            app.config.globalProperties.$models = this.models
            app.config.globalProperties.$api = this.api
        })
    }

    this.setValidateOptions = (params) => {
        if (params) {
            if (typeof params !== 'object') {
                throw new Error(`options.validate must be an object, ${typeof params} given`)
            }
        } else {
            // set default
            params = defaultValidateErrorSettings
        }
        this.validateErrorTemplator = new ValidateErrorTemplator(
            params.templates,
            params.getCurrentLangCb,
            params.defaultLang
        )
    }
    this.getValidateError = (type, ctx) => {
        return this.validateErrorTemplator.getError(type, ctx)
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
