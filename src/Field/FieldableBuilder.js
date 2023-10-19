/**
 * Базовый класс для сборщика поля и сборщика вариативного поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class FieldableBuilder {
    /** @var Boolean обязательность значения */
    _required = true
    /** @var mixed значение по умолчанию */
    _default
    /** @var String|Object информация о способе отображения поля */
    _display

    /**
     * Установка поля обязательным.
     * @param Boolean|True установить обязательным
     * @return this
     */
    required(value = true) {
        this._required = value
        return this
    }
    /**
     * Установка поля необязательным.
     * @param Boolean|True установить необязательным
     * @return this
     */
    nullable(value = true) {
        this._required = !value
        return this
    }

    /**
     * Установка значения по умолчанию.
     * @param mixed значение по умолчанию
     * @return this
     */
    default(value) {
        this._default = value
        return this
    }

    /**
     * Установка информации о способе отображения поля.
     * @param mixed информации о способе отображения поля
     * @return this
     */
    display(value) {
        this._display = value
        return this
    }


    /**
     * Экспорт свойств для поля/вариативного поля.
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
