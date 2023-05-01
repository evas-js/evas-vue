/**
 * evas-vue plugin initialization.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 */

import { reactive } from 'vue'

export const EvasVue = new function () {
    this.state = reactive({})

    this.install = (app) => {
        app.config.globalProperties.$state = this.state
    }
}
