/**
 * Query for data model.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

export const Query = class {
    static conditions = {
        '=':    (col, val) => { return col === val }, 
        '==':   (col, val) => { return col == val }, 
        '!=':   (col, val) => { return col != val },
        '!==':  (col, val) => { return col !== val },
        '>':    (col, val) => { return col > val }, 
        '>=':   (col, val) => { return col >= val }, 
        '<':    (col, val) => { return col < val },
        '<=':   (col, val) => { return col <= val }, 
    }

    model
    _wheres = []
    _orders = []
    _relations = []
    _limit
    _offset = 0

    constructor(model) {
        this.model = model
    }

    _where(isOr, column, condition, value) {
        if (arguments.length === 3) {
            value = condition
            condition = '='
        }
        this._wheres.push({ column, condition, value, isOr })
        return this
    }

    where(/*column, condition, value*/) {
        return this._where(false, ...arguments)
    }

    orWhere(/*column, condition, value*/) {
        return this._where(true, ...arguments)
    }

    _whereIn(isOr, column, values) {
        if ('string' !== typeof column) {
            throw new Error(
                `whereIn argument column must be a string, ${typeof column} given`
            )
        }
        if (!Array.isArray(values)) {
            throw new Error(
                `whereIn argument values must be an array, ${typeof values} given`
            )
        }
        return this._where(isOr, (row) => {
            return values.includes(row[column])
        })
    }

    whereIn(/*column, values*/) {
        return this._whereIn(false, ...arguments)
    }

    orWhereIn(/*column, values*/) {
        return this._whereIn(true, ...arguments)
    }

    orderBy(column, desc = false) {
        this._orders.push({ column, desc })
        return this
    }

    limit(limit) {
        this._limit = limit
        return this
    }

    offset(offset) {
        this._offset = offset
        return this
    }

    paging(page, limit) {
        this._offset = (page - 1) * limit
        this._limit = limit
        return this
    }

    with(relations) {
        relations = Array.isArray(relations) ? relations : arguments
        this._relations.push(...relations)
        return this
    }

    withAll() {
        let relations = []
        this.model.eachRelations(relation => {
            relations.push(relation.name)
        })
        return relations ? this.with(relations) : this
    }

    withAllRecousive() {
        // 
        return this
    }

    first() {
        let rows = this.limit(1).get()
        return rows.length > 0 ? rows[0] : null
    }

    _groupBy(collection, iteratee) {
        return collection.reduce(function (records, record) {
            let key = iteratee(record)
            if (records[key] === undefined) records[key] = []
            records[key].push(record)
            return records
        }, {})
    }

    executeWhereClosure(row, cb) {
        let res = cb(row, this)
        // if ('Table' === this.model.name) {
        //     console.log(
        //         'executeWhereClosure', 
        //         // this._wheres, res, Boolean(this.first()),
        //         this._wheres, res,
        //         row.id, row.license, row.number, row.reinvest_level
        //     )
        // }
        return typeof res === 'boolean' ? res : Boolean(this.whereFilter([row]).length)
    }

    getComparator (row) {
        return where => {
            // Function with Record and Query as argument.
            if (typeof where.column === 'function') {
                let newQuery = new this.constructor(this.model)
                return newQuery.executeWhereClosure(row, where.column)
            }
            // Function with Record value as argument.
            if (typeof where.value === 'function') {
                return where.value(row[where.column])
            }
            // Check if column value is in given where Array.
            if (Array.isArray(where.value)) {
                return where.value.includes(row[where.column])
            }
            // Simple equal check.
            let check = this.constructor.conditions[where.condition]
            // if ('Table' === this.model.name && check(row[where.column], where.value)) {
            //     console.log(
            //         'check', this._wheres, check(row[where.column], where.value),
            //         row.id, row.license, row.number, row.reinvest_level
            //     )
            // }
            return check(row[where.column], where.value)
        }
    }

    whereFilter(rows) {
        if (!rows) rows = this.model.all()
        if (this._wheres.length) {
            let whereTypes = this._groupBy(
                this._wheres, where => where.isOr ? 'or' : 'and'
            )
            // if ('Table' === this.model.name) {
            //     console.log(this.model.name, 'whereTypes', whereTypes, this._wheres)
            // }
            rows = rows.filter(row => {
                let comparator = this.getComparator(row)
                let results = []
                whereTypes.and && results.push(whereTypes.and.every(comparator))
                whereTypes.or && results.push(whereTypes.or.some(comparator))
                // if ('Table' === this.model.name) {
                //     console.log(
                //         { 
                //             id: row.id,
                //             license: row.license, 
                //             number: row.number, 
                //             reinvest_level: row.reinvest_level, 
                //             user1_id: row.user1_id 
                //         }, 
                //         results, results.includes(true)
                //     )
                // }
                return results.includes(true)
            })

            // return rows.filter(row => {
            //     for (let where of this._wheres) {
            //         if (where.function) {
            //             if (!where.function(row, this)) return false
            //             continue
            //         }
            //         let check = this.constructor.conditions[where.condition]
            //         if (!check(row[where.column], where.value)) {
            //             return false 
            //         }
            //     }
            //     return true
            // })
        }
        return rows
    }

    get() {
        // let rows = this.model.all()

        // where (filter)
        // rows = this.whereFilter(rows)
        let rows = this.whereFilter()

        // orderBy (sort)
        if (this._orders.length) {
            for (let order of this._orders) {
                rows = rows.sort((a, b) => {
                    if (a[order.column] === b[order.column]) return 0
                    return (a[order.column] > b[order.column] ? 1 : -1) 
                    * (order.desc ? -1 : 1)
                })
            }
        }

        // limit & offset (slice)
        if (this._limit) {
            rows = rows.slice(this._offset, this._offset + this._limit)
        }

        // with (concat)
        if (this._relations.length > 0) {
            // let relations = this.model.getRelations()
            rows.forEach((row) => {
                this._relations.forEach((relationName) => {
                    let relation = this.model.getRelation(relationName)

                    if (!relation) {
                        console.error(
                            `Model ${this.model.name} not has relation ${relationName}`
                        )
                        return
                    }

                    let relateds = this.getRelated(relation, row)

                    if (!relateds) return
                    if (['belongsTo'].includes(relation.type)) {
                        relateds = relateds[0]
                    }
                    row[relation.name] = relateds
                })
            })
        }

        return rows
    }

    getRelated({ type, foreignModel, foreign, local, link = null }, row) {
        if (link) row = this.getRelated(link, row)
        if (!row) return

        let qb = foreignModel.query()

        if (['hasManyList'].includes(type)) {
            if ('id' === local) {
                qb = foreignModel.all().filter(_row => {
                    return _row[foreign].includes(row[local])
                })
            } else {
                qb = qb.whereIn(foreign, row[local]).get()
            }
        } else {
            qb = qb.where(foreign, '=', row[local]).get()
        }

        return qb
    }
}
