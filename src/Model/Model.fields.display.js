/**
 * Расширение модели поддержкой отображения полей.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { logger } from '../Log.js'
import { Model } from './Model.js'
import { Group, Tabs, Block } from './FieldGrouping.js'

/** @var Object Правила переменного отображения полей */
Model.rulesForVariableDisplayOfFields = {}
/** @var Object Правила группировки полей */
Model._fieldGrouping = null
/** @var Object правила отображения полей */
Model._displayRules = null
/** @var Array|String|Number|null отображаемая группа полей */
Model.prototype.$displayGroup = null

/**
 * Установка правил отображения полей модели.
 * @return Object
 */
Model.setDisplayRules = function () {
    return {}
}

/**
 * Установка группировки полей.
 * @return Object|Array
 */
Model.setFieldGrouping = function () {
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
/**
 * Группировка полей в группы-табы.
 * @param String|Number имя группы
 * @param Array|Object содержимое групп
 * @return Tabs
 */
Model.tabs = function (name, items) {
    return new Tabs(name, items)
}


/**
 * Получение правил отображения поля или полей модели.
 * @param String|null имя поля
 * @return Object правила поля или полей
 */
Model.displayRules = function () {
    if (!this._displayRules) {
        const rules = this.setDisplayRules()
        // подтягиваем пропсы из полей
        Object.keys(rules).forEach(fieldName => {
            const field = this.field(fieldName)
            if (!field) {
                console.log(this.fields())
                console.error(`Field for displayRule with name "${fieldName}" does not exists`)
                delete rules[fieldName]
                return
            }
            let fieldRules = rules[fieldName]
            if (field?.options) {
                if ('string' === typeof fieldRules) {
                    fieldRules = { component: fieldRules }
                }
                if (!fieldRules.props) fieldRules.props = {}
                fieldRules.props.options = field.options
            }
            field.setDisplay(fieldRules)
        })
        this._displayRules = rules
    }
    return this._displayRules
}

/**
 * Получение правил группировки полей.
 * @return Object правила группировки
 */
Model.fieldGrouping = function () {
    logger.methodCall(`${this.entityName}.fieldGrouping`, null, () => {
        if (!this._fieldGrouping) {
            this._fieldGrouping = this.setFieldGrouping() ?? {}
            if (!(this._fieldGrouping instanceof Group)) { 
                this._fieldGrouping = new Block(this._fieldGrouping)
            }
            logger.line('set this._fieldGrouping')
        } else {
            logger.line('get cached this._fieldGrouping')
        }
        logger.keyValue('this._fieldGrouping', this._fieldGrouping)
    })
    return this._fieldGrouping
}

/**
 * Получение группы полей или поля.
 * @param Array|...(String|Number) путь к группе
 * @return Group|Field
 */
Model.fieldGroup = function (names) {
    if (arguments.length && !Array.isArray(names)) {
        names = arguments.length > 1 ? Array.from(arguments) : [names]
    }
    return logger.methodCall(`${this.entityName}.fieldGroup`, arguments, () => {
        logger.keyValue('names', names)
        const result = this.fieldGrouping().next(names)
        logger.keyValue('result', result)
        return result
    })
}
Model.prototype.$fieldGroup = function () {
    return logger.methodCall(`${this.$entityNameWithId}.$fieldGroup`, arguments, () => {
        this.$displayGroup = this.constructor.fieldGroup(...arguments)
        logger.keyValue('this.$displayGroup', this.$displayGroup)
        return this.$displayGroup
    })
}

/**
 * Получение полей для отображения с учётом группировки.
 * @param Array|String|Number|null отображаемая группа полей
 * @return Array поля доступные к отображению
 */
Model.prototype.$displayFields = function (group = null) {
    return logger.methodCall(`${this.$entityNameWithId}.$displayFields`, arguments, () => {
        if (group) this.$fieldGroup(group)
        if (!this.$displayGroup) {
            this.$fieldGroup()
        }
        logger.keyValue('this.$displayGroup', this.$displayGroup)
        logger.keyValue('this', this)
        const fields = this.$displayGroup.recursiveFields()
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
    // if (!fieldNames) fieldNames = this.$fieldNames()
    if (!fieldNames) fieldNames = this.$displayFields()
    return Object.values(fieldNames).reduce((viewFields, fieldName) => {
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
}

/**
 * Очистка данных полей.
 * @param Array имена полей
 * @return Array имена полей
 */
Model.prototype.$clearFields = function (fieldNames = null) {
    return logger.methodCall(`${this.$entityNameWithId}.$clearFields`, arguments, () => {
        if (!fieldNames) fieldNames = this.constructor.fieldNames()
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
        const clearFields = this.constructor.fieldNames().filter(
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
        this.$clearDisplayFields() // очистка отображаемых полей
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
