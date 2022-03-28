import validateTypeObject, { ObjectDescr, validateContent } from '../../../ts/checktype'
import { FIELDTYPE } from '../../../ts/typing'
import type { FormMessage } from '../typing'

export enum ObjectType {

    ACTIONRESULT, FORMMESSAGE
}

function checkUndefined(o: any, ...args: string[]): string | undefined {
    for (let a of args) {
        if (o[a]) return undefined
    }
    return ` one of attributes should be defined: ${args}`
}

const validateFormMessage: validateContent = (oo: FormMessage): string | undefined => {
    return checkUndefined(oo, 'messagedirect', 'message', 'js')
}

// type: FormMessage
const FormMessageV: ObjectDescr = {
    objectname: 'FormMessage',
    attrs: [
        { attr: 'js' },
        { attr: 'messagedirect' },
        { attr: 'message' },
        { attr: 'params', type: { isArray: true } }
    ],
    validateC: validateFormMessage
}

// type: FieldError
const FieldErrorV: ObjectDescr = {
    objectname: 'FieldError',
    attrs: [
        { attr: 'field', required: true },
        { attr: 'err', required: true, type: FormMessageV }
    ]

}

// type: ActionResult
const ActionResultV: ObjectDescr = {
    objectname: 'ActionResult',
    attrs: [
        { attr: 'success', required: true, type: FIELDTYPE.BOOLEAN },
        { attr: 'error', type: { isArray: true, arraytype: FieldErrorV } }
    ]

}

function validateObject(t: ObjectType, mess: string, o: object) {
    let v: ObjectDescr | undefined = undefined
    switch (t) {
        case ObjectType.ACTIONRESULT: v = ActionResultV; break;
        case ObjectType.FORMMESSAGE: v = FormMessageV; break;
    }
    if (v === undefined) return
    validateTypeObject(mess, o, v)
}

export default validateObject