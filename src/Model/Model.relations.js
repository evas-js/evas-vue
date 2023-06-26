/**
 * Model relations.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'
import { Relation } from '../Relation.js'

Model.setRelations = function () {
    return []
}

Model.relations = function () {
    if (this.isRootModel()) return []
    if (!this._relations) {
        this._relations = {}
        let relations = this.setRelations()
        for (let name in relations) {
            let relation = relations[name]
            if (relation instanceof Relation) {
                relation.name = name
                this._relations[name] = relation
            }
        }
    }
    return this._relations
}

Model.relationNames = function () {
    return Object.keys(this.relations())
}

Model.relation = function (name) {
    return this.relations()[name]
}

Model.eachRelations = function (cb, names) {
    if (!names) names = this.relationNames()
    for (let name of names) {
        let field = this.relation(name)
        if (!field) {
            console.warn(`Relation field "${name}" not registered in model "${this.$name}"`)
        }
        if (cb.apply(this, [field, name])) return true
    }
    return false
}

// set relations
Model.belongsTo = function (model, local, foreign) {
    return new Relation('belongsTo', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
Model.hasOne = function (model, foreign, local) {
    return new Relation('hasOne', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
Model.hasMany = function (model, foreign, local) {
    return new Relation('hasMany', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
Model.hasManyToMany = function (
    model,
    foreign,
    local,
    { model: modelLink, foreign: foreignLink, local: localLink }
) {
    return new Relation('hasManyToMany', {
        model: this,
        local,
        foreign,
        foreignModel: model,
        link: {
            foreignModel: modelLink,
            foreign: foreignLink,
            local: localLink,
        },
    })
}
Model.hasManyList = function (model, foreign, local) {
    return new Relation('hasManyList', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
