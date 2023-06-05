
require('./Model.fields.js')
require('./Model.relations.js')
require('./Model.state.js')
require('./Model.validate.js')

// import { addFields } from './Model.fields.js'

export function Model() {
    console.log('init Model')
}

// Model.addFields = addFields

// export class Model {
//     constructor() {
//         console.log('init Model')
//     }
// }

Model.isRootModel = function () {
    return this.name === 'Model'
}

Model.prototype.name1 = 'test'

Model.prototype.hello = function () {
    console.log('hello')
}
