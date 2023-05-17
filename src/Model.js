/**
 * Data Model.
 * @package evas-vue-core
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */
import { Api } from './Api.js'
import { EvasVueCore } from './index.js'
import { Field } from './Field.js'
import { ModelsStore } from './ModelsStore.js'
import { Relation } from './Relation.js'
import { Query } from './Query.js'

export const Model = class {
    // fields

    static _cachedFields = undefined
    static _cachedRelations = undefined

    static fields() {
        return {}
    }

    static prepareCachedFieldsAndRelations() {
        if (this._cachedFields && this._cachedRelations) return
        this._cachedFields = {}
        this._cachedRelations = {}
        let fields = this.fields()
        for (let name in fields) {
            let field = fields[name]
            if (field instanceof Field) {
                field.name(name)
                this._cachedFields[name] = field
            }
            if (field instanceof Relation) {
                field.name(name)
                this._cachedRelations[name] = field
            }
        }
    }

    static cachedFields() {
        if (!this._cachedFields) {
            this.prepareCachedFieldsAndRelations()
        }
        return this._cachedFields
    }

    static cachedRelations() {
        if (!this._cachedRelations) {
            this.prepareCachedFieldsAndRelations()
        }
        return this._cachedRelations
    }

    eachFields(cb, keys) {
        if (!keys) keys = Object.keys(this.constructor.cachedFields())
        for (let name of keys) {
            let field = this.constructor.cachedFields()[name]
            if (!field) {
                throw new Error(
                    `Field "${name}" not registered in model "${this.$name}"`
                )
            }
            if (cb.apply(this, [field, name])) return true
        }
        return false
    }

    getField(key) {
        return this.constructor.cachedFields()[key]
    }

    static eachRelations(cb, keys) {
        if (!keys) keys = Object.keys(this.cachedRelations())
        for (let name of keys) {
            let field = this.cachedRelations()[name]
            if (!field) {
                throw new Error(
                    `Relation field "${name}" not registered in model "${this.$name}"`
                )
            }
            if (cb.apply(this, [field, name])) return true
        }
        return false
    }

    static attr(_default) {
        return new Field({ _default })
    }
    static number(_default) {
        return new Field({ _default })
    }
    static string(_default) {
        return new Field({ _default })
    }
    static boolean(_default) {
        return new Field({ _default })
    }

    // Relations
    static belongsTo(model, local, foreign) {
        return new Relation('belongsTo', {
            model: this,
            local,
            foreign,
            foreignModel: model,
        })
    }
    static hasOne(model, foreign, local) {
        return new Relation('hasOne', {
            model: this,
            local,
            foreign,
            foreignModel: model,
        })
    }
    static hasMany(model, foreign, local) {
        return new Relation('hasMany', {
            model: this,
            local,
            foreign,
            foreignModel: model,
        })
    }
    static hasManyToMany(
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
    static hasManyList(model, foreign, local) {
        return new Relation('hasManyList', {
            model: this,
            local,
            foreign,
            foreignModel: model,
        })
    }

    static getRelation(name) {
        return this.cachedRelations()[name] || null
    }
    static getRelations() {
        return this.cachedRelations()
    }

    // map
    static get map() {
        return ModelsStore.model(this.entityName)
    }

    static _processInsert(entity, afterFetch = false) {
        // call api insert
        if (this.useApi && false === afterFetch) {
            this.fetchInsert(entity.$dirtyData)
        }
    }

    static _processUpdate(entity, afterFetch = false) {
        this.map.set(entity.$id, entity)
        // call api update
        if (this.useApi && false === afterFetch) {
            this.fetchUpdate({ id: this.$id, ...entity.$dirtyData })
        }
    }

    /**
     * Вставка или обновление записи.
     * @param Model|object запись или данные записи
     * @param Boolean|null это данные после api запроса?
     * @return Model запись
     */
    static insertOrUpdate(entity, afterFetch = false) {
        if (Array.isArray(entity)) {
            return entity.map((_entity) =>
                this.insertOrUpdate(_entity, afterFetch)
            )
        } else if (entity && entity instanceof this) {
            if (entity.$id) this._processUpdate(entity, afterFetch)
            else this._processInsert(entity, afterFetch)

            if (afterFetch) entity.$saveState()
            return entity
        } else if (entity && 'object' === typeof entity) {
            return new this(entity, afterFetch)
        }
    }

    /**
     * Вставка записи.
     * @param Model|object запись или данные записи
     * @param Boolean|null это данные после api запроса?
     * @return Model запись
     */
    static insert(entity, afterFetch = false) {
        if (Array.isArray(entity)) {
            return entity.map((_entity) => this.insert(_entity, afterFetch))
        } else if (entity && entity instanceof this) {
            if (entity.$id) throw new Error('Empty entity has $id')
            this._processInsert(entity, afterFetch)

            if (afterFetch) entity.$saveState()
            return entity
        } else if (entity && 'object' === typeof entity) {
            return new this(entity, !afterFetch)
        }
    }

    /**
     * Обновление записи.
     * @param Model|object запись или данные записи
     * @param Boolean|null это данные после api запроса?
     * @return Model запись
     */
    static update(entity, afterFetch = false) {
        if (Array.isArray(entity)) {
            return entity.map((_entity) => this.update(_entity, afterFetch))
        } else if (entity && entity instanceof this) {
            if (!entity.$id) throw new Error('Entity not has $id')
            this._processUpdate(entity, afterFetch)

            if (afterFetch) entity.$saveState()
            return entity
        } else if (entity && 'object' === typeof entity) {
            return new this(entity, !afterFetch)
        }
    }

    /**
     * Удаление записи.
     * @param Model|object|Number запись или данные записи или id записи
     * @param Function колбэк после удаления
     * @param Boolean|null это данные после api запроса?
     * @return Model запись
     */
    static delete(entity, cb, afterFetch = false) {
        if (Array.isArray(entity)) {
            entity.forEach((_entity) => this.delete(_entity, afterFetch))
        }
        if (entity && entity instanceof this) {
            return this.delete(entity.$id, cb, afterFetch)
        }
        if (entity && 'object' === typeof entity) {
            return new this(entity).$delete()
        }
        if (entity && ('number' === typeof entity || 'string' === typeof entity)) {
            this.map.delete(entity)
            if (this.useApi && false === afterFetch) {
                // call api delete
                this.fetchDelete({ id: entity }, cb)
            }
        }
    }

    // size, all, each

    /**
     * Получение количества загруженных записей.
     * @return Number
     */
    static size() {
        return this.map.size
    }

    /**
     * Получение всех загруженных записей.
     * @return Model[]
     */
    static all() {
        return Array.from(this.map.values())
    }

    /**
     * Итеративная обработка загруженных записей.
     * @param Function колбэк обработки
     */
    static each(cb) {
        if (!cb) return
        this.map.forEach((entity) => cb(entity))
    }

    static entityName

    // instance

    get $name() {
        return this.constructor.entityName
    }

    constructor(data, afterFetch = true) {
        if (data) this.$fill(data)
        if (!afterFetch || this.$id) {
            this.constructor.insertOrUpdate(this, afterFetch)
        }
        return new Proxy(this, this)
    }

    $fill(data) {
        this.eachFields((field) => {
            this[field._name] = undefined !== data[field._name]
                ? data[field._name]
                : field._default
        })
        this.constructor.eachRelations((field) => {
            this[field._name] = undefined !== data[field._name]
                ? data[field._name]
                : field._default
            field.foreignModel.insertOrUpdate(data[field._name], true)
        })
    }

    static primary = 'id'

    get $id() {
        return this[this.constructor.primary]
    }
    set $id(value) {
        this[this.constructor.primary] = value
    }

    // track updates
    $state = {}

    get(target, prop) {
        // return this[prop] || 'MAGIC'
        return this[prop] || null
    }

    set(target, prop, value) {
        // console.log('MAGIC SET', prop)
        this[prop] = value
        return true
    }

    deleteProperty(target, prop) {
        delete this[prop]
    }

    ownKeys(target) {
        return target && target.keys ? target.keys() : Object.keys(this)
    }

    $saveState() {
        this.$state = structuredClone(this)
    }

    // flags

    get $isNew() {
        return this.$id ? false : true
    }
    get $isDirty() {
        // const cb = field => this.isDirtyField(field._name) ? true : null
        // return this.eachFields(cb) || this.constructor.eachRelations(cb)
        return this.dirtyFields().length
    }

    /**
     * @var Array изменённые поля записи
     */
    get $dirtyFields() {
        return this.dirtyFields()
    }

    /**
     * @var Object изменённые данные {key: val, ...}
     */
    get $dirtyData() {
        let data = {}
        this.$dirtyFields.forEach((field) => (data[field] = this[field]))
        return data
    }

    /**
     * Проверка полей на изменение.
     * @param Array|null поля записи или все поля
     * @return Boolean[]
     */
    dirtyFields(keys) {
        let edited = []
        this.eachFields((field) => {
            if (this.isDirtyField(field._name)) {
                console.log(
                    'cb',
                    field._name,
                    this.isDirtyField(field._name),
                    this.$state[field._name]
                )
                edited.push(field._name)
            }
        }, keys)
        this.constructor.eachRelations((relation) => {
            // if (this.isDirtyField(relation._name)) {
            if (this.isDirtyRelateds(relation)) {
                console.log(
                    'cb-r',
                    relation._name,
                    // this.isDirtyField(relation._name),
                    // this.$state[relation._name]
                    relation,
                    this.$state[relation._name]?.[relation.foreign],
                    this[relation._name]?.[relation.foreign]
                )
                edited.push(relation._name)
            }
        }, keys)
        return edited
    }

    isDirtyRelateds(relation) {
        return this.$state[relation._name]?.[relation.foreign] 
        !== this[relation._name]?.[relation.foreign]
    }

    /**
     * Проверка поля на изменённость.
     * @param String|Number имя поля
     * @return Boolean
     */
    isDirtyField(name) {
        let stateValue = this.$state[name]
        if (Array.isArray(stateValue)) {
            return JSON.stringify(stateValue.sort()) !== JSON.stringify(this[name].sort())
        } else if (typeof(stateValue) === 'object' && ![null, undefined].includes(stateValue)) {
            return JSON.stringify(stateValue) !== JSON.stringify(this[name])
        }
        return stateValue !== this[name]
        // return Array.isArray(stateValue) || (
        //     typeof(stateValue) === 'object' && ![null, undefined].includes(stateValue)
        // )
        //     ? JSON.stringify(stateValue.sort()) !== JSON.stringify(this[name].sort())
        //     : stateValue !== this[name]
        
    }

    /**
     * Выдает пользовательское значение поля, для типа options - значение из списка.
     * @param String|Number имя поля
     * @return String
     */
    getFieldValue(name){
        const field = this.getField(name)
        return field._options ? field._options[this[name]] : this[name]
    }

    /**
     * Откат изменений записи.
     * @param Array|null поля записи или все поля
     */
    rollbackChanges(keys) {
        const cb = field => {this[field._name] = structuredClone(this.$state[field._name])}
        this.eachFields(cb, keys)
        this.constructor.eachRelations(cb, keys)
    }

    // validate

    validate() {
        /*
        this.eachFields((field) => {
            field.throwIfNotValid(this[field._name])
        }, this.dirtyFields())
        */
    }

    // instance mutations

    /**
     * Сохранение записи.
     * @param Function колбэк после удаления
     */
    $save(cb) {
        console.log('$save', this, this.$isDirty, this.$id, this.$isNew)
        // console.log(this.$updatedProps.keys())
        if (!this.$isDirty) return

        if (this.$isNew) {
            this.beforeInsert()
            this.validate()
            this.constructor.fetchInsert(this.$dirtyData, cb)
            this.$saveState()
            this.afterInsert()
        } else {
            this.beforeUpdate()
            this.validate()
            this.constructor.fetchUpdate(
                { id: this.$id, ...this.$dirtyData },
                cb
            )
            this.$saveState()
            this.afterUpdate()
        }
    }

    /**
     * Удаление записи.
     * @param Function колбэк после удаления
     */
    $delete(cb) {
        this.beforeDelete()
        this.constructor.delete(this, cb)
        this.$saveState()
        this.afterDelete()
    }

    // instance mutation hooks
    beforeInsert() {}
    afterInsert() {}
    beforeUpdate() {}
    afterUpdate() {}
    beforeDelete() {}
    afterDelete() {}

    // api
    static api
    static setApi(api) {
        this.api = api instanceof Api ? api : new Api(api)
    }
    static _useApi = true
    static set useApi(useApi) {
        this._useApi = useApi
    }
    static get useApi() {
        return this._useApi
    }

    // api hooks
    static beforeFetched() {}
    static afterFetched() {}
    static beforeSubFetched() {}
    static afterSubFetched() {}

    static getApiRoute(name) {
        if (!this.routes) {
            throw new Error(`Model ${this.entityName} routes does not exists`)
        }
        if (!this.routes[name]) {
            throw new Error(`Model ${this.entityName} not has router ${name}`)
        }
        if (!this.api) {
            throw new Error(
                `Api object does not provide to ${this.entityName} model`
            )
        }
        return this.routes[name]
    }

    static apiRoute(name, args, cb) {
        let parts = this.getApiRoute(name)
        return this.api.call(parts, args, (data, res) => cb(data, res))
    }

    static hasApiRoute(name) {
        try {
            this.getApiRoute(name)
        } catch (e) {
            console.error(e)
            return false
        }
        return true
    }

    static get totalRows() {
        return ModelsStore.totalRows(this.entityName)
    }
    static set totalRows(value) {
        ModelsStore.setTotalRows(this.entityName, value)
    }

    static apiRouteWithSave(name, args, cb) {
        if (args instanceof Model) args = Object.assign({}, args)
        return this.apiRoute(name, args, (data, res) => {
            this.beforeFetched(name, data, res)
            // console.log(name, 'fetched api data:', data)
            if (data) {
                if (data.$data) {
                    data.$data.forEach((sub) => {
                        let type = sub.type || this.entityName
                        let model = EvasVueCore.getModel(type)
                        if (!model) {
                            console.error(`Model ${type} not found`)
                            return
                        }
                        this.beforeSubFetched(type, sub)
                        let entities = model.insertOrUpdate(sub.rows, true)
                        if (sub.totalRows) model.totalRows = sub.totalRows
                        if (cb) cb(sub, entities, res)
                        this.afterSubFetched(type, entities)
                    })
                } else {
                    let entities = this.insertOrUpdate(data, true)
                    if (cb) cb(data, entities, res)
                    this.afterFetched(name, data, entities, res)
                }
            }
        })
    }

    static fetch(name, args, cb) {
        return this.apiRouteWithSave(name, args, cb)
    }

    static fetchList(args, cb) {
        return this.apiRouteWithSave('list', args, cb)
    }

    static fetchOne(args, cb) {
        return this.apiRouteWithSave('one', args, cb)
    }

    static fetchInsert(args, cb) {
        return this.apiRouteWithSave('insert', args, cb)
    }

    static fetchUpdate(args, cb) {
        return this.apiRouteWithSave('update', args, cb)
    }

    static fetchDelete(args, cb) {
        // return this.apiRouteWithSave('delete', args, cb)
        return this.apiRoute('delete', args, (data) => {
            console.log('fetched api data:', data)
            if (cb) cb(data)
            // this.afterFetch()
        })
    }

    // queries
    static query() {
        return new Query(this)
    }
    static find(id) {
        let query = this.query()
        // if (arguments.length > 1 && !Array.isArray(id)) id = arguments
        return Array.isArray(id)
            ? query.whereIn(this.primary, id).get()
            : query.where(this.primary, id).first()
    }
}
