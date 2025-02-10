/**
 * Сборщик поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */
import { FieldableBuilder } from './FieldableBuilder.js'

export class FieldBuilder extends FieldableBuilder {
    /** @var { String } имя поля */
    _name
    /** @var { String } тип */
    _type
    /** @var { Object|Array } опции значения */
    _options

    /** @var { FieldableBuilder|Object|Array } правила вложенного поля для массивов и объектов */
    _itemOf

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this.setProps(props)
    }

    name(value) {
        this._name = value
        return this
    }
    type(value) {
        this._type = value
        return this
    }
    options(value) {
        if (!value) {
            return console.error('Options not setting')
        }
        if (['string', 'number'].includes(typeof value)) {
            value = arguments
        }
        if (!(Array.isArray(value) || 'object' === typeof value)) {
            return console.error(
                `Options of the field ${this._name} must be an array or an object,`,
                `${typeof value} given`, 
                value
            )
        }
        if (Object.prototype.toString.call(value) === '[object Arguments]') {
            value = Array.from(value)
        }
        this._options = value
        return this
    }
}
