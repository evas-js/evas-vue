/**
 * Relation for data model.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class Relation {
    /** @var String имя связи */
    name
    /** @var String тип связи (belongsTo, hasOne, hasMany, hasManyList, manyToMany) */
    type
    /** @var Model локальная модель */
    model
    /** @var String локальный ключ */
    local
    /** @var Model внешняя модель */
    foreignModel
    /** @var String внешний ключ */
    foreign
    /** @var Object вложенная связь */
    link
    /** @var Boolean связь ко многим или к одной записи */
    multiple

    /**
     * @param String тип связи
     * @param Object свойства связи
     */
    constructor(type, props) {
        for (let key in props) this[key] = props[key]
        this.type = type

        if (!this.local) {
            this.local = this.type === 'belongsTo'
                ? this.generateKey(this.foreignModel, true)
                : this.generateKey(this.model)
        }
        if (!this.foreign) {
            this.foreign = this.type === 'belongsTo'
                ? this.generateKey(this.foreignModel)
                : this.generateKey(this.model, true)
        }
        this.multiple = !['belongsTo', 'hasOne'].includes(type)
    }

    /**
     * Генерация ключа, используется если не передан явно.
     * @param Model модель
     * @param Boolean генерировать ли ключ вместе с именем модели
     * @return String сгенерированный ключ
     */
    generateKey(model, full = false) {
        let p = model.primary
        return full ? `${model.entityName.toLowerCase()}_${p}` : p
    }
}
