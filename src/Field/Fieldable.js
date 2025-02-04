/**
 * Базовый класс для поля и вариативного поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class Fieldable
{
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

    /** @var { String } имя модели  */
    modelName
    
    /** @var String|Object информация о способе отображения поля */
    display

    /** Геттер лейбла или имени поля. */
    get labelOrName() { return this.label || this.name }

    /**
     * Установка информации о способе отображения поля.
     * @param { any } display информации о способе отображения поля
     * @return { this }
     */
    setDisplay(display) {
        this.display = display
        return this
    }

    /**
     * Установка имени модели.
     * @param { String } name имя модели
     * @return { this }
     */
    setModelName(name) {
        this.modelName = name
        return this
    }

    /**
     * Проверка на пустое значение.
     * @param { any } value значение
     * @return { Boolean }
     */
    isEmptyValue(value) {
        return [null, undefined].includes(arguments.length > 0 ? value : this.value)
        // if (arguments.length < 1) value = this.value
        // return this.type === 'array' && typeof value === 'array' 
        // ? value.length < 1
        // : [null, undefined, ''].includes(value)
    }
}
