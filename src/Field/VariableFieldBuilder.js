
/**
 * Сборщик вариативного поля.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { FieldableBuilder } from './FieldableBuilder.js'

export class VariableFieldBuilder extends FieldableBuilder {
    /** @var { String } тип вариативного поля (oneOf, anyOf, allOf) */
    _type
    /** @var { FieldableBuilder[]|Fieldable[] } поля */
    _fields

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this.setProps(props)
    }
}
