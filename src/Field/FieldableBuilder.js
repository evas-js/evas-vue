/**
 * Базовый класс для сборщика поля и сборщика вариативного поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { PropsWritable } from './PropsWritable.js'

export class FieldableBuilder extends PropsWritable {
    /** @var { String } лейбл поля */
    _label
    /** @var { Boolean } обязательность значения */
    _required = true
    /** @var { Number } минимальное значение или длина */
    _min
    /** @var { Number } максимальное значение или длина */
    _max
    /** @var { String } паттерн значения */
    _pattern
    /** @var { String } имя совпадающего поля */
    _same
    /** @var { String } лейбл совпадающего поля */
    _sameLabel
    /** @var { Function|null } кастомная функция валидации */
    _customValidate
    /** @var { any } значение по умолчанию */
    _default
    /** @var { String|Object } информация о способе отображения поля */
    _display

    /**
     * 
     * @param Установка лейбла поля.
     * @param { any } значение
     * @returns { this }
     */
    label(value) {
        this._label = value
        return this
    }

    /**
     * Установка поля обязательным.
     * @param { Boolean|true } value установить обязательным
     * @return { this }
     */
    required(value = true) {
        this._required = value
        return this
    }
    /**
     * Установка поля необязательным.
     * @param { Boolean|true } value установить необязательным
     * @return { this }
     */
    nullable(value = true) {
        this._required = !value
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

    same(value, label) {
        this._same = value
        if (label) this.sameLabel(label)
        return this
    }
    sameLabel(value) {
        this._sameLabel = value
        return this
    }
    customValidate(value) {
        if (typeof value !== 'function') {
            console.error('customValidate must be a Function, given:', value)
        }
        this._customValidate = value
        return this
    }

    /**
     * Установка значения по умолчанию.
     * @param { any } value значение по умолчанию
     * @return { this }
     */
    default(value) {
        this._default = value
        return this
    }

    /**
     * Установка информации о способе отображения поля.
     * @param { any } value  информации о способе отображения поля
     * @return { this }
     */
    display(value) {
        this._display = value
        return this
    }


    /**
     * Экспорт свойств для поля/вариативного поля.
     * @return { Object }
     */
    export() {
        return Object.fromEntries(Object.entries(this).map(([key, val]) => [key.substring(1), val]))
    }

    build() {
        console.warn('FieldableBuilder can not build. Use FieldBuilder or VariableFieldBuilder or custom');
    }

    recursiveBuild(name, model, instance, children, alias = null) {
        const nested = instance[children]
    
        if (nested) {
            if (nested.build) {
                instance[children] = nested.build?.(name, model)
            } else {
                for (let key in nested) {
                    nested[key] = nested[key].build?.(alias ?? key, model)
                }
            }
        }
    
        instance.name ??= name
        instance.setModel(model)
        return instance
    }
}
