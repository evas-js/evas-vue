/**
 * Model fields.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { Model } from './Model.js'

/**
 * Установка правил отображения полей модели.
 * @return Object
 */
Model.setView = function () {
    return {}
}

/**
 * Получение правил отображаемия поля или полей модели.
 * @param String|null имя поля
 * @return Object правила поля или полей
 */
Model.view = function (part = null) {
    const viewFields = part ? this.setView()[part] : this.setView()

    // подтягиваем пропсы из полей
    Object.keys(viewFields).forEach(fieldName => {
        const field = this.field(fieldName)
        if (field?.options) {
            if ('string' === typeof viewFields[fieldName]) {
                viewFields[fieldName] = {
                    component: viewFields[fieldName],
                }
            }
            if (!viewFields[fieldName].props) viewFields[fieldName].props = {}

            viewFields[fieldName].props.options = field.options
        }
    })

    return viewFields
}

/**
 * Получение правила отображения поля или самого поля.
 * @param String имя поля
 * @return Object|Field
 */
Model.fieldView = function (name) {
    return this.view(name) || this.field(name)
}
Model.prototype.$fieldView = function (name) {
    return this.constructor.fieldView(name)
}

/**
 * Получение имен полей с правилами отображением.
 * @return Array
 */
Model.viewFieldNames = function () {
    return Object.keys(this.view())
}

/**
 * Итеративная обработка отображений полей в функции.
 * @param Function функция обработки
 * @param Array|null имена полей
 * @return Boolean
 */
Model.eachView = function (cb, names) {
    if (!names) names = this.viewFieldNames()
    for (let name of names) {
        let view = this.fieldView(name)
        if (!view) {
            throw new Error(
                `View for field "${name}" not registered in model "${this.entityName}"`
            )
        }
        if (cb.apply(this, [view, name])) return true
    }
    return false
}

/**
 * @var Правила переменного отображения полей
 */
Model.rulesForVariableDisplayOfFields = {}

/**
 * Применение правил отображение полей в зависимости от значения других полей.
 * @param String|null имя поля
 * @return Array поля доступные к отображению
 */
Model.prototype.$applyFieldsViewRules = function (part = null) {
    return Object.keys(this.constructor.view(part)).reduce((viewFields, fieldName) => {
        const rule = this.constructor.rulesForVariableDisplayOfFields?.[fieldName]
        if (rule) {
            if (Array.isArray(rule)) {
                const [parentFieldName, parentValue] = rule
                const isShow =
                    viewFields.includes(parentFieldName) &&
                    this?.[parentFieldName] === parentValue
                if (isShow) viewFields.push(fieldName)
            } else if ('function' === typeof rule) {
                rule(this) && viewFields.push(fieldName)
            }
        } else {
            if (part) {
                console.log(part, viewFields);
                viewFields.push(fieldName)
            } else {
                viewFields.push(fieldName)
            }
        }
        return viewFields
    }, [])
}

Model.prototype.$viewField = function () {
    return this.$applyFieldsViewRules().map(fieldName => {
        return {
            key: fieldName,
            value: this[fieldName],
            view: this.$fieldView(fieldName) || 'string',
            isDirtyField: this.$isDirtyField(fieldName) || false,
            disabled: false,
        }
    })
}
