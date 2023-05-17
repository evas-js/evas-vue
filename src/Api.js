/**
 * Api class for models.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export const Api = class {
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
                    `Не найден Api endpoint "${sub}" для роута "${parts.join('.')}"`
                )
            }
        }
        return handler
    }

    call(parts, args, cb) {
        this.beforeCall(parts, args, cb)
        console.log('call api:', parts)
        this.endpoint(parts)(args, (data, res) => {
            if (cb) cb(data, res)
        })
        this.afterCall(parts, args, cb)
    }

    beforeCall() {}
    afterCall() {}
}
