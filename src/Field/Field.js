/**
 * Field validator.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class Field {
    /** @var string имя поля */
    name
    // /** @var string лейбл поля */
    // label
    // /** @var bool обязательность значения */
    // required = true
    // /** @var string тип */
    // type = 'string'
    // /** @var number минимальное значение или длина */
    // min = 0
    // /** @var number|null максимальное значение или длина */
    // max
    // /** @var string|null паттерн значения */
    // pattern
    // /** @var object|array|null опции значения */
    // options
    // /** @var string|null имя совпадающего поля */
    // same
    // /** @var string|null лейбл совпадающего поля */
    // sameLabel
    // /** @var mixed значение по умолчанию */
    // default
    // /** @var mixed значение */
    // value
    // /** @var string|null ошибка валидации */
    // error
    // /** @var string|null вид отображения */
    // view
    
    /**
     * Конструктор.
     * @param object|null свойства поля
     */
    constructor(props) {
        // if (props) for (let key in props) this[key] = props[key]
        if (props) for (let key in props) {
            let func = this[key]
            if (func) func.call(this, props[key])
        }

        return new Proxy(this, {
            // get: function (self, key) {
            get: function (self, key) {
                // if (key in self) return self[key]
                return function () {
                    console.log(key, arguments)
                    return this
                }
            }
        })
    }

}
