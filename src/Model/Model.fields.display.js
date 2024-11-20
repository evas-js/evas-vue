/**
 * Расширение модели поддержкой отображения полей.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'
import { Addon, Block, Group, Tabs } from './FieldGrouping.js'

/** @var Object Правила переменного отображения полей */
Model.rulesForVariableDisplayOfFields = {}
/** @var Object Правила группировки полей */
Model.prototype._fieldNamesGrouping = null
/** @var Object правила отображения полей */
// Model.prototype._displayRules = null
/** @var Array|String|Number|null отображаемая группа полей */
Model.prototype.$displayGroup = null

/**
 * Установка правил отображения полей модели.
 * @return Object
 */
Model.prototype.$setDisplayRules = function () {
    return {}
}

/**
 * Установка группировки полей.
 * @return Object|Array
 */
Model.prototype.$setFieldGrouping = function () {
    return {}
}

/**
 * Группировка полей в группу-блок.
 * @param String|Number имя группы
 * @param Array|Object содержимое группы
 * @return Block
 */
Model.block = function (name, items) {
    // return new Block(...prepareArgs(...arguments)) 
    return new Block(name, items) 
}
Model.prototype.$block = function () {
    return this.constructor.block(...arguments)
}
/**
 * Группировка полей в группы-блоки.
 * @param Array|Object группы-блоки
 * @return Array
 */
Model.blocks = function(items) {
    return Object.entries(items).map(([name, item]) => {
        return this.block(name, item)
    })
}
Model.prototype.$blocks = function () {
    return this.constructor.blocks(...arguments)
}
/**
 * Группировка полей в группы-табы.
 * @param String|Number имя группы
 * @param Array|Object содержимое групп
 * @return Tabs
 */
Model.tabs = function (name, items) {
    return new Tabs(name, items)
}
Model.prototype.$tabs = function () {
    return this.constructor.tabs(...arguments)
}
/**
 * Дополнительные вставки для отображения.
 * @param mixed данные
 * @return Addon
 */
Model.addon = function (data) {
    return new Addon(data)
}
Model.prototype.$addon = function () {
    return this.constructor.addon(...arguments)
}


/**
 * Получение правил отображения поля или полей модели.
 * @param String|null имя поля
 * @return Object правила поля или полей
 */
Model.prototype.$displayRules = function () {
    // подтягиваем пропсы из полей
    const rules = this.$setDisplayRules()
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
        const field = this.$field(fieldName)
        if (!field) {
            console.log(this.$fields())
            console.error(`Field for displayRule with name "${fieldName}" does not exists`)
            return
        }
        if (field?.options) {
            if ('string' === typeof fieldRules) {
                fieldRules = { component: fieldRules }
            }
            if (!fieldRules.props) fieldRules.props = {}
            fieldRules.props.options = field.options
        }
        field.setDisplay(fieldRules)
    })
    return rules
}

/**
 * Получение правил группировки полей.
 * @return Object правила группировки
 */
Model.prototype.$fieldNamesGrouping = function () {
    this.$displayRules()
    logger.methodCall(`${this.$entityNameWithId}.$fieldNamesGrouping`, null, () => {
        if (!this._fieldNamesGrouping) {
            this._fieldNamesGrouping = this.$setFieldGrouping() ?? {}
            if (!(this._fieldNamesGrouping instanceof Group)) { 
                this._fieldNamesGrouping = new Block(this._fieldNamesGrouping)
            }
            this._fieldNamesGrouping.setFields(this)
            logger.line('set this._fieldNamesGrouping')
        } else {
            logger.line('get cached this._fieldNamesGrouping')
        }
        logger.keyValue('this._fieldNamesGrouping', this._fieldNamesGrouping)
    })
    return this._fieldNamesGrouping
}

/**
 * Получение группы полей или поля.
 * @param Array|...(String|Number) путь к группе
 * @return Group|Field
 */
// Model.fieldNamesGroup = function (names) {
//     if (![null, undefined].includes(names) && arguments.length && !Array.isArray(names)) {
//         names = arguments.length > 1 ? Array.from(arguments) : [names]
//     }
//     return logger.methodCall(`${this.entityName}.fieldNamesGroup`, arguments, () => {
//         logger.keyValue('names', names)
//         const result = this.fieldNamesGrouping().next(names)
//         logger.keyValue('result', result)
//         return result
//     })
// }
// Model.prototype.$fieldNamesGroup = function () {
//     return logger.methodCall(`${this.$entityNameWithId}.$fieldNamesGroup`, arguments, () => {
//         this.$displayGroup = this.constructor.fieldNamesGroup(...arguments)
//         logger.keyValue('this.$displayGroup', this.$displayGroup)
//         return this.$displayGroup
//     })
// }

Model.prototype.$fieldsGroup = function (names) {
    if (![null, undefined].includes(names) && arguments.length && !Array.isArray(names)) {
        names = arguments.length > 1 ? Array.from(arguments) : [names]
    }
    return logger.methodCall(`${this.$entityNameWithId}.$fieldsGroup`, arguments, () => {
        logger.keyValue('names', names)
        this.$displayGroup = this.$fieldNamesGrouping().next(names)
        logger.keyValue('this.$displayGroup', this.$displayGroup)
        // if (!group) return group
        // return group.eachFieldsRecursive((key, value) => {
        //     console.log(key, value)
        //     return this.field(value)
        // })
        return this.$displayGroup
    })
}

/**
 * Получение полей для отображения с учётом группировки.
 * @param Array|String|Number|null отображаемая группа полей
 * @return Array поля доступные к отображению
 */
Model.prototype.$displayFields = function (group = null) {
    this.$displayRules()
    return logger.methodCall(`${this.$entityNameWithId}.$displayFields`, arguments, () => {
        if (group) this.$fieldsGroup(group)
        if (!this.$displayGroup) {
            this.$fieldsGroup()
        }
        logger.keyValue('this.$displayGroup', this.$displayGroup)
        logger.keyValue('this', this)
        const fields = this.$displayGroup.concatFields()
        logger.keyValue('fields', fields)
        const displayFields = this.$applyFieldsDisplayRules(fields)
        logger.keyValue('return displayFields', displayFields)
        return displayFields
    })
}


/**
 * Применение правил отображение полей в зависимости от значения других полей.
 * @param String|Number|null отображаемая группа полей
 * @return Array поля доступные к отображению
 */
Model.prototype.$applyFieldsDisplayRules = function (fieldNames = null) {
    return logger.methodCall(`${this.$entityNameWithId}.$applyFieldsDisplayRules`, arguments, () => {
        // if (!fieldNames) fieldNames = this.$fieldNames()
        if (!fieldNames) fieldNames = this.$displayFields()
        return Object.values(fieldNames).reduce((viewFields, fieldName) => {
            if (!['string', 'number'].includes(typeof fieldName)) {
                fieldName = fieldName.name
            }
            const rule = this.constructor.rulesForVariableDisplayOfFields?.[fieldName]
            if (rule) {
                if (Array.isArray(rule)) {
                    const [parentFieldName, parentValue] = rule
                    if (viewFields.includes(parentFieldName)) {
                        let expected = this?.[parentFieldName]
                        expected = this.$field(parentFieldName).convertTypeWithDefault(expected)
                        if (expected === parentValue) viewFields.push(fieldName)
                    }
                } else if ('function' === typeof rule) {
                    rule(this) && viewFields.push(fieldName)
                }
            } else {
                viewFields.push(fieldName)
            }
            return viewFields
        }, [])
    })
}

/**
 * Очистка данных полей.
 * @param Array имена полей
 * @return Array имена полей
 */
Model.prototype.$clearFields = function (fieldNames = null) {
    return logger.methodCall(`${this.$entityNameWithId}.$clearFields`, arguments, () => {
        if (!fieldNames) fieldNames = this.$fieldNames()
        fieldNames.forEach(name => {
            if (name !== 'id') this[name] = this.$state[name]
        })
        return fieldNames
    })
}
/**
 * Очистка данных отображаемых полей.
 */
Model.prototype.$clearDisplayFields = function () {
    logger.methodCall(`${this.$entityNameWithId}.$clearDisplayFields`, arguments, () => {
        const displayFields = this.$displayFields()
        const clearFields = this.$fieldNames().filter(
            name => !displayFields.includes(name)
        )
        this.$clearFields(clearFields)
    })
}

/**
 * Выбор группы полей (переключение табов).
 * @param Group группа полей
 */
Model.prototype.$selectGroup = function (group) {
    logger.methodCall(`${this.$entityNameWithId}.$selectGroup`, arguments, () => {
        // this.$clearDisplayFields() // очистка отображаемых полей
        group.select()
    })
}



// /**
//  * Получение полей для отображения.
//  * @param String|Number|null отображаемая группа полей
//  * @return Array поля доступные к отображению
//  */
// Model.prototype.$displayFields = function (group = null) {
//     return logger.methodCall(`${this.$entityName}{${this.$id}}.$displayFields`, arguments, () => {
//         this.$displayGroup = group
//         const displayFields = this.$applyFieldsDisplayRules(group)
//         logger.keyValue('return', displayFields)
//         return displayFields
//     })
// }

// Model.prototype.$displayFieldsWithPrepare = function (cb = null, group = null) {
//     return this.$displayFields(group).map(fieldName => {
//         const fieldProps = {
//             fieldName: fieldName,
//             value: this[fieldName],
//             view: this.$field(fieldName),
//             isDirty: this.$isDirtyField(fieldName) || false,
//         }
//         return cb ? cb(fieldProps) : fieldProps
//     })
// }
