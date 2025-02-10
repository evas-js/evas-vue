/**
 * Расширение полей методом установки свойств.
 * @param { Object } ctx контекст
 * @param { Object|null } props свойства поля
 */

// import { FieldableBuilder } from './FieldableBuilder.js'

export class PropsWritable {
    // /**
    //  * @param { Object|null } props свойства поля
    //  */
    // constructor(props) {
    //     this.setProps(props)
    //     // const showKeys = [
    //     //     'webapp.default_language',
    //     //     'webapp.autologout_interval',
    //     // ]
    //     // if (showKeys.includes(props.name)) {
    //     //     console.error(this.constructor.name, this.name, this, props)
    //     // }
    // }

    /**
     * Установка свойств поля
     * @param { Object|null } props свойства поля
     */
    setProps(props) {
        if (props) {
            if (typeof props.export === 'function') {
                // if (props instanceof FieldableBuilder) {
                props = props.export()
            }
            if ('object' === typeof props && !Array.isArray(props)) {
                for (let key in props) {
                    this[key] = props[key]
                }
            }
            else {
                console.error(
                    'Field props must be an object or an instanceof FieldableBuilder,',
                    `${typeof props} given`,
                    props
                )
            }
        }
    }
}
