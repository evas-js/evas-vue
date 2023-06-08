/**
 * Relation for data model.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export class Relation {
    name
    type
    model
    local
    foreignModel
    foreign
    link

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
    }
    
    setDefaults() {

    }

    generateKey(model, full = false) {
        let p = model.primary
        return full ? `${model.entityName.toLowerCase()}_${p}` : p
    }
}
