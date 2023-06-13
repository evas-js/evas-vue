/**
 * Mock api help.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

// import { EvasVue } from './index.js'
// import { ModelsStoreConstructor } from './ModelsStore.js'

// const ModelsStore = new ModelsStoreConstructor

// let models = structuredClone(EvasVue.models) // error!
// Object.values(models).forEach(model => {
//     Object.defineProperty(model, 'map', { 
//         get: function () {
//             return ModelsStore.model(this.entityName) 
//         }
//     })
// })

import { logger } from './Log.js'


function Exception(message, code = 200){
    this.message = message
    this.code = code
}
function ResponseDataBuilder(...args) {
    let $data = []
    this.pushRows = (rows, totalRows, type) => {
        if (!rows) rows = []
        let argsRows = { rows, totalRows }
        if (type) argsRows.type = type
        $data.push(argsRows)
        return this
    }
    this.build = () => {
        return { $data }
    }
    if (args) {
        args.forEach(rowsData => this.pushRows(...rowsData))
        return this.build()
    }
}

// function Response(code, body) {
//     this.code = code
//     this.body = body
// }


export class MockApi {
    mock = {}
    debug = true

    constructor(mock, debug) {
        if (mock) this.mock = mock
        if (debug) this.debug = debug
    }

    getMock(name, args) {
        let mock = this.mock[name]
        if (!mock) this.err500(`Mock "${name}" does not exists`)
        if (!Array.isArray(mock)) {
            if (typeof mock === 'function') {
                mock = mock(args)
                console.log('getMock', name, mock)
            }
            if (!Array.isArray(mock)) {
                // this.err500(`Mock "${name}" must be an array, actual: ${typeof mock}`)
                mock = [mock]
            }
        }
        // console.log('getMock', name, mock, this.mock[name])
        return mock
    }

    // response
    err400(message) { throw new Exception(message, 400) }
    err401(message) { throw new Exception(message, 401) }
    err403(message) { throw new Exception(message, 403) }
    err404(message) { throw new Exception(message, 404) }
    err500(message) { throw new Exception(message, 500) }

    // sendError(e) { return new Response(e.code, { error: e.message }) }
    // send200() { return new Response(200, new ResponseDataBuilder(...arguments))}
    sendError(e) { return { error: e.message } }
    send200() { return new ResponseDataBuilder(...arguments)}
    

    // help CRUD
    findById(rows, id, returnIndex = false) {
        //id = Number(id) Все id как правило uuid!!!
        if (returnIndex) {
            let index = rows.findIndex(row => row.id === id)
            if (-1 === index) this.err400(`Запись с id=${id} не найдена`)
            return index
        } else {
            let row = rows.find(row => row.id === id)
            if (!row) this.err400(`Запись с id=${id} не найдена`)
            return row
        }
    }

    // CRUD

    insert(name, args) {
        try {
            let rows = this.getMock(name, args)
            // this.log(`${name}.insert`, args)
            logger.methodCall('MockApi.insert', arguments)
            if (!args.id) {
                args.id = rows.reduce((maxId, { id }) => isNaN(+id) || maxId < id ? id : maxId, 0)
                if ('number' === typeof args.id) args.id++
                if ('string' === typeof args.id) args.id = crypto.randomUUID()
            }
            rows.push(args)
            let row = this.findById(rows, args.id)
            return this.send200([ [row], rows.length ])
        } catch (e) {
            return this.sendError(e)
        }
    }

    update(name, args) {
        try {
            let rows = this.getMock(name, args)
            // this.log(`${name}.update`, args.id, args)
            logger.methodCall('MockApi.update', arguments)
            if (!args.id) this.err400('Укажите id записи')
            let row = this.findById(rows, args.id)
            for (let key in args) {
                row[key] = args[key]
            }
            return this.send200([ [row], rows.length ])
        } catch (e) {
            return this.sendError(e)
        }
    }

    remove(name, args) {
        try {
            let rows = this.getMock(name, args)
            // this.log(`${name}.remove`, args.id)
            logger.methodCall('MockApi.remove', arguments)
            if (!args.id) this.err400('Укажите id записи')
            if (!Array.isArray(rows)) rows = [rows]
            let index = this.findById(rows, args.id, true)
            rows.splice(index, 1)
            return this.send200([ null, rows.length ])
        } catch (e) {
            return this.sendError(e)
        }
    }

    one(name, args) {
        try {
            let rows = this.getMock(name, args)
            // this.log(`${name}.one`, args.id)
            logger.methodCall('MockApi.one', arguments)
            if (!args.id) this.err400('Укажите id записи')
            let row = this.findById(rows, args.id)
            return this.send200([ [row], rows.length ])
        } catch (e) {
            return this.sendError(e)
        }
    }

    list(name, args) {
        try {
            let rows = this.getMock(name, args)
            // this.log(`${name}.list`, args, rows)
            logger.methodCall('MockApi.list', arguments)

            if (!args) args = {}
            if (args.filters) {
                let filters = args.filters
                // wheres (filter)
                if (filters.wheres) {
                    rows = wheres(rows, filters.wheres)
                }
                // search = wheres (filter)
                if (filters.search) {
                    rows = search(rows, filters.search)
                }
                // orders (sort)
                if (filters.orders) {
                    rows = orders(rows, filters.orders)
                }
            }

            let totalRows = rows.length

            // limit & offset (slice)
            if (args.limit) {
                let limit = args.limit || null // limit
                let page = args.page || 1 // offset * limit
                let offset = (page - 1) * limit
                rows = rows.slice(offset, offset + limit)
            }

            return this.send200([ rows, totalRows ])
        } catch (e) {
            return this.sendError(e)
        }
    }

    custom(cb) {
        try {
            return cb.call(this)
        } catch (e) {
            console.error(e)
            return this.sendError(e)
        }
    }
}

function search(rows, search) {
    console.log('search', search)
    search = search.toLowerCase()
    return wheres(rows, (row) => {
        for (let key in row) {
            let value = row[key]
            if (
                value &&
                value.includes &&
                value.toLowerCase().includes(search)
            ) {
                return true
            }
        }
        return false
    })
}

const conditions = {
    '=': (col, val) => col === val,
    '==': (col, val) => col == val,
    '!=': (col, val) => col != val,
    '!==': (col, val) => col !== val,
    '>': (col, val) => col > val,
    '>=': (col, val) => col >= val,
    '<': (col, val) => col < val,
    '<=': (col, val) => col <= val,
}
function wheres(rows, wheres) {
    if (!Array.isArray(wheres)) wheres = [wheres]
    return rows.filter((row) => {
        for (let where of wheres) {
            if ('function' === typeof where) {
                if (!where(row, this)) return false
                continue
            }
            let check = conditions[where.condition]
            if (!check(row[where.column], where.value)) {
                return false
            }
        }
        return true
    })
}
function orders(rows, orders) {
    for (let order of orders) {
        rows = rows.sort((a, b) => {
            if (a[order.column] === b[order.column]) return 0
            return (
                (a[order.column] > b[order.column] ? 1 : -1) *
                (order.desc ? -1 : 1)
            )
        })
    }
    return rows
}


