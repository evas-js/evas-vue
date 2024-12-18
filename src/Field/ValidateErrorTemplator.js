/**
* ValidateErrorTemplator.
* @package evas-vue
* @author Egor Vasyakin <egor@evas-php.com>
* @license CC-BY-4.0
*/
export class ValidateErrorTemplator {
    templatesByLangs = {}
    getCurrentLangCb
    defaultLang
    // errorTypes = ['required', 'length', 'range', 'pattern', 'options', 'same', 'type']

    setLangTemplates(lang, templates) {
        if (!templates) {
            throw new Error(`validation error templates for lang ${lang} is empty`)
        }
        if (typeof templates !== 'object') {
            throw new Error(
                'validation error templates for lang ' 
                + `"${lang}" must be an object ['type' => 'callback'], ${typeof templates} given`
            )
        }
        const incorrect = Object.entries(templates).find(([, handler]) => typeof handler !== 'function')
        if (incorrect) {
            throw new Error(
                'typeof validation error template for lang '
                + `"${lang}", type "${incorrect[0]}" must be a function`
                + `, ${typeof incorrect[0]} given`
            )
        }
        this.templatesByLangs[lang] = templates
    }
    getCurrentLang() {
        return this.getCurrentLangCb()
    }
    getError(type, ctx) {
        let message = this.templatesByLangs[this.getCurrentLang()]?.[type]?.(ctx) 
        ?? this.templatesByLangs[this.defaultLang]?.[type]?.(ctx)
        if (!message) {
            console.error(
                `no has template for error of type "${type}", lang "${this.getCurrentLang()}"`
                + (
                    this.defaultLang && this.defaultLang !== this.getCurrentLang() 
                        ? ` or default lang "${this.defaultLang}"` 
                        : ''
                )
            )
            message = `incorrect "${ctx.labelOrName}"`
        }
        return message
    }

    constructor(templatesByLangs, getCurrentLangCb, defaultLang) {
        if (!templatesByLangs) return
        if (typeof templatesByLangs !== 'object') {
            throw new Error(`typeof templatesByLangs must be an object, ${typeof templatesByLangs} given`)
        }
        const langs = Object.keys(templatesByLangs)
        if (langs.length < 1) {
            throw new Error('templatesByLangs is empty')
        }
        Object.entries(templatesByLangs).forEach(([lang, templates]) => this.setLangTemplates(lang, templates))

        // this.defaultLang = defaultLang ?? langs.at(0)
        this.defaultLang = defaultLang
        if (!getCurrentLangCb || typeof getCurrentLangCb !== 'function') {
            throw new Error(`typeof getCurrentLangCb must be a function, ${typeof getCurrentLangCb} given`)
        }
        this.getCurrentLangCb = getCurrentLangCb
    }
}

export const defaultValidateErrorSettings = {
    'templates': {
        'ru': {
            required: (ctx) => `Поле "${ctx.labelOrName}" обязательно для заполнения`,
            length: (ctx) => {
                let msg = `Длина поля "${ctx.labelOrName}" должна быть`
                if (ctx.min) msg += ` от ${ctx.min}`
                if (ctx.max) msg += ` до ${ctx.max}`
                return msg + ' символов'
            },
            range: (ctx) => {
                let msg = `Значение поля "${ctx.labelOrName}" должно быть в диапазоне`
                if (ctx.min) msg += ` от ${ctx.min}`
                if (ctx.max) msg += ` до ${ctx.max}`
                return msg
            },
            pattern: (ctx) => `Проверьте правильность поля "${ctx.labelOrName}"`,
            options: (ctx) => `Значение поля "${ctx.labelOrName}" не совпадает с доступными опциями`,
            same: (ctx) => `Значения полей "${ctx.labelOrName}" и "${ctx.sameLabelOrName}" должны совпадать`,
            type: (ctx) => `Неверный тип поля "${ctx.labelOrName}", ожидается "${ctx.expectedType}", текущий тип поля "${ctx.currentType}"`
        },
    },
    getCurrentLangCb: () => 'ru',
    defaultLang: 'ru',
}
