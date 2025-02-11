/**
 * Базовый класс для поля и вариативного поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { PropsWritable } from './PropsWritable.js'

export class Fieldable extends PropsWritable {
    // static emptyValues = [null, undefined]
    static emptyValues = [null, undefined, '']

    /** @var { String } имя поля */
    name
    /** @var { String } лейбл поля */
    label

    /** @var { Boolean } обязательность значения */
    required = true
    /** @var { Number } минимальное значение или длина */
    min = 0
    /** @var { Number } максимальное значение или длина */
    max
    /** @var { String } паттерн значения */
    pattern
    /** @var { String } имя совпадающего поля */
    same
    /** @var { String } лейбл совпадающего поля */
    sameLabel

    /** @var { any } значение по умолчанию */
    default

    /** @var { Model } модель поля */
    model
    
    /** @var String|Object информация о способе отображения поля */
    display

    /** @var { any } лейбл или имя поля */
    get labelOrName() { return this.label || this.name }

    /** @var { any } лейбл или имя совпадающего поля */
    get sameLabelOrName() { return this.sameLabel || this.same }

    /** @var { String } имя модели  */
    get modelName() { return this.model.entityName }

    /**
     * Установка информации о способе отображения поля.
     * @param { any } value информации о способе отображения поля
     * @return { this }
     */
    setDisplay(value) {
        this.display = value
        return this
    }

    /**
     * Получение значения по умолчанию.
     * @return { any }
     */
    getDefault() {
        return 'function' === typeof this.default ? this.default() : this.default
    }

    /**
     * Установка модели поля.
     * @param { Model } value модель
     * @return { this }
     */
    setModel(value) {
        this.model = value
        return this
    }

    /**
     * Проверка на пустое значение.
     * @param { any } value значение
     * @return { Boolean }
     */
    isEmptyValue(value) {
        return this.constructor.emptyValues.includes(arguments.length > 0 ? value : this.value)
    }
}
