/**
 * Классы для группировки полей.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */
import { logger } from '../Log.js'

export class Group {
    type = 'group'
    name
    items
    names = {}
    // selectedIndex

    constructor(name, items) {
        // if (arguments < 2 || ('object' === typeof name && name)) {
        if (arguments < 2 || 'object' === typeof name) {
            items = name
            name = null
        }
        this.name = name
        this.setItems(items)
    }
    setItems(items) {
        this.items = items
    }
    eachItems(cb, items = null) {
        if (!items) items = this.items
        if (items) Object.entries(items).forEach(([key, item]) => {
            cb(key, item)
        })
    }
    fillItems(items, cb) {
        this.items = {}
        this.eachItems((key, item) => {
            this.items[key] = cb(key, item)
        }, items)
    }
    setItemsInBlock(items) {
        this.fillItems(items, (key, item) => {
            // if (Array.isArray(item) || ('object' === typeof item && !(item instanceof Group))) {
            //     // просто набор полей, если это массив или объект
            //     item = (new Block(key, item)).setRegular()
            // }
            if (Array.isArray(item) || (
                'object' === typeof item 
                && [Group, Addon].every(className => !(item instanceof className))
            )) {
                // превращаем в блок, если поля объединены в массив или объект
                item = new Block(key, item)
            }
            if (item instanceof Group && !item.name) {
                // устанавливаем ключ как имя, если не указано
                item.name = key
            }
            return item
        })
    }
    
    next(names, cb) {
        const className = this.constructor.name
        return logger.methodCall(`${className}.next`, null, () => {
            logger.keyValue('this', this)
            logger.keyValue('names', names)
            
            if (!names || !names.length) {
                if (cb) cb(this)
                // logger.keyValue(`result is ${className} items`, this.items)
                // return this.items
                logger.keyValue(`result is ${className}`, this)
                return this
                // return this instanceof Tabs ? this.selected?.items : this.items
            }
            const next = names.shift()
            logger.keyValue('nextName', next)
            const group = Object.values(this.items).find(item => item.name == next)
            logger.keyValue('next', group)
            if (cb) cb(group)
            return group ? group.next(names) : group
        })
    }

    setFields(model) {
        logger.methodCall(`${this.constructor.name}.setFields`, null, () => {
            logger.keyValue('model', model)
            logger.keyValue('group', this)

            this.eachItems((key, item) => {
                this.names[key] = item
                if (item instanceof Group) {
                    item.setFields(model)
                } else if (item instanceof Addon) {
                    this.items[key] = item
                } else {
                    const field = model.field?.(item) || model.$field?.(item)
                    if (field) this.items[key] = field
                    else delete this.items[key]
                }
            })

        })
    }

    concatFields() {
        let fields = []
        this.eachItems((key, item) => {
            if (item instanceof Group) {
                if (!(item instanceof Tab) || item.selected) {
                    fields = fields.concat(item.concatFields())
                }
            } else {
                fields.push(item)
            }
        })
        return fields
    }
}

export class Tabs extends Group {
    type = 'tabs'
    // selectedIndex
    
    get selected() {
        // return this.items.find(item => item.name == this.selectedIndex)
        return this.items[this.selectedIndex] ?? null
    }
    setItems(items) {
        let selected = undefined
        this.fillItems(items, (key, item) => {
            // console.warn(key, item)
            if (!(item instanceof Tab)) {
                // превращаем в Tab
                item = new Tab(key, item)
            }
            if (item instanceof Group && !item.name) {
                // устанавливаем ключ как имя, если не указано
                item.name = key
            }
            item.parent = this
            if (selected === undefined) {
                // предвыбранный таб
                selected = key
            }
            return item
        })
        this.selectTab(selected)
    }

    selectTab(name) {
        if (!this.items[name]) return;
        if (this.selected) this.selected.selected = false
        this.selectedIndex = name
        if (this.selected) this.selected.selected = true
    }
}

export class Tab extends Group {
    type = 'tab'
    // selected = false
    // parent
    setItems(items) {
        this.setItemsInBlock(items)
    }
    select() {
        this.parent.selectTab(this.name)
    }
}

export class Block extends Group {
    type = 'block'
    // regular = false
    setItems(items) {
        this.setItemsInBlock(items)
    }
    // setRegular(value = true) {
    //     this.regular = value
    // }
}

export class List extends Block {
    type = 'list'
}

export class Addon{
    type = 'addon'
    // data
    constructor(data) {
        this.data = data
    }
}
