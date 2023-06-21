/**
 * Field builder.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class FieldBuilder {
    /** @var String имя поля */
    _name
    /** @var String лейбл поля */
    _label
    /** @var Boolean обязательность значения */
    _required = true
    /** @var String тип */
    _type
    /** @var Number минимальное значение или длина */
    _min = 0
    /** @var Number максимальное значение или длина */
    _max
    /** @var String паттерн значения */
    _pattern
    /** @var Object|Array опции значения */
    _options
    /** @var String имя совпадающего поля */
    _same
    /** @var String лейбл совпадающего поля */
    _sameLabel
    /** @var mixed значение по умолчанию */
    _default

    name(value) {
        this._name = value
        return this
    }
    label(value) {
        this._label = value
        return this
    }
    required(value) {
        this._required = value
        return this
    }
    nullable() {
        this._required = false
        return this
    }
    type(value) {
        this._type = value
        return this
    }
    min(value) {
        this._min = value
        return this
    }
    max(value) {
        this._max = value
        return this
    }
    pattern(value) {
        this._pattern = value
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
    same(value, label) {
        this._same = value
        if (label) this.sameLabel(label)
        return this
    }
    sameLabel(value) {
        this._sameLabel = value
        return this
    }

    constructor(props = null) {
        if (props) {
            if (props instanceof FieldBuilder) {
                props = props.export()
            }
            if ('object' === typeof props && !Array.isArray(props)) for (let key in props) {
                this[key] = props[key]
            }
            else {
                console.error(
                    'Field props must be an object or an instanceof FieldBuilder,',
                    `${typeof props} given`,
                    props
                )
            }
        }
    }

    /**
     * Экспорт свойств для поля.
     * @return Object
     */
    export() {
        let data = {}
        Object.entries(this).forEach(([key, value]) => {
            key = key.substring(1)
            data[key] = value
        })
        return data
    }
}
