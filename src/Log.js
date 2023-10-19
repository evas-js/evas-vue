/**
 * Logger.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */
import { EvasVue } from './index.js'

export const logger = new class {
    
    get debug() {
        return EvasVue.debug
    }

    isArguments(item) {
        return Object.prototype.toString.call(item) === '[object Arguments]';
    }

    line(...messages) {
        if (this.debug) console.log(...messages)
    }

    keyValue = (key, value) => {
        if (this.debug) console.log('%c%s =%O', 'color: #fff', key, value)
    }

    group(...messages) {
        if (this.debug) console.groupCollapsed(...messages)
    }

    groupEnd() {
        if (this.debug) console.groupEnd()
    }

    returnGroup(cb, ...messages) {
        this.group(...messages)
        let res = cb()
        this.groupEnd()
        return res
    }

    arguments(args) {
        if (!this.debug) return
        if ([undefined, null].includes(args)) return
        let count = args?.length || 0
        let templ = `Arguments (${count})`
        count ? this.returnGroup(() => {
            if (this.isArguments(args)) args = Array.from(args)
            args.forEach((arg, i) => {
                this.line(i, arg)
            })
        }, templ) : this.line(templ)
    }

    methodCall(name, args, cb) {
        let templ = [
            '%cevas-vue %c%s()%c', 
            'color: #7f9adc',
            'color: #209761',
            name,
            ''
        ]
        if ('function' === typeof cb) {
            return this.returnGroup(() => {
                this.arguments(args)
                return cb()
            }, ...templ)
        } else {
            if (args) {
                templ.push(... (Array.isArray(args) || this.isArguments(args) ? args : [args]), ')')
            }
            this.line(...templ)
        }
    }
}

// class LogGroup {
//     // 
// }
