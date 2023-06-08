/**
 * Api class for models.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

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
                    `Api endpoint "${sub}" for route path "${parts.join('.')}" not found`
                )
            }
        }
        return handler
    }

    call(parts, args, cb) {
        this.beforeCall(parts, args, cb)
        console.log('Api.call(', parts, ')')
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
