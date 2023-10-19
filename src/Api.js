/**
 * Api для моделей.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from './Log.js'

export class Api {
    endpoints
    errorCb

    constructor(endpoints, errorCb) {
        this.endpoints = endpoints
        this.errorCb = errorCb
    }

    endpoint(parts) {
        if ('string' === typeof parts) parts = parts.split('.')
        let handler = this.endpoints
        for (let sub of parts) {
            handler = handler[sub]
            if (!handler) {
                throw new Error(
                    `Api endpoint "${parts.join('.')}" not found. "${sub}" does not exists`
                )
            }
        }
        return handler
    }

    call(parts, args, cb) {
        this.beforeCall(parts, args, cb)
        logger.methodCall('Api.call', arguments)
        // console.log('evas-vue Api.call(', parts, ')')
        this.endpoint(parts)(args, (data, res) => {
            if (cb) cb(data, res)
            else console.log('Api.call(', parts, ') response:', data, res)
        })
        this.afterCall(parts, args, cb)
    }

    // api hooks
    beforeCall() {}
    afterCall() {}
}
