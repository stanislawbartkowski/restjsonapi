import { FIELDTYPE } from './typing'
import { isObject, isArray } from './j'
import { internalinfoerrorlog } from './l'

export type validateContent = (o:any) => undefined | string

type TypeArrayDescr = {
    isArray?: boolean
    arraytype?: TypeDescr
}

type TypeDescr = TypeArrayDescr | FIELDTYPE | ObjectDescr


type AttrDescr = {
    attr: string,
    required?: boolean,
    type?: TypeDescr[] | TypeDescr
}

export type ObjectDescr = {
    attrs: AttrDescr[] | AttrDescr
    objectname: string
    validateC? : validateContent
}

function prepareTypes(des: AttrDescr): TypeDescr[] {
    if (des.type)
        return (isArray(des.type)) ? des.type as TypeDescr[] : [des.type as TypeDescr]
    return [FIELDTYPE.STRING]
}


function createErrType(o: any, d: AttrDescr): string {

    const tt: TypeDescr[] = prepareTypes(d)
    const tnames: string[] = tt.map(e => isObject(e) ? (e as ObjectDescr).objectname : (e as FIELDTYPE))
    return `Expected type ${tnames}, found ${typeof (o)}`
}


function oktype(o: any, d: TypeDescr): [boolean, string?] {

    if ((d as TypeArrayDescr).isArray && isArray(o)) {
        const a: any[] = o as any[]
        for (const e of a) {
            const [ok, notvalid] = oktype(e, ((d as TypeArrayDescr).arraytype as TypeDescr))
            if (!ok) return [false, ` Array elem ${notvalid}`]
        }
        return [true]
    }

    if (isObject(d) && isObject(o)) {
        const notvalid: string | undefined = objectValidator(o, d as ObjectDescr)
        return notvalid ? [false, `${(d as ObjectDescr).objectname}:${notvalid}`] : [true]
    }
    return [typeof (o) === (d as FIELDTYPE)]
}


function attrValidator(o: any, d: AttrDescr): string | undefined {
    const tt: TypeDescr[] = prepareTypes(d)
    for (const t of tt) {
        const [ok, notvalid] = oktype(o, t)
        if (notvalid) return `${d.attr} ${notvalid}`
        if (ok) return undefined
    }
    return createErrType(o, d)

}

function objectValidator(oo: object, descr: ObjectDescr): string | undefined {

    const attrs: [AttrDescr] = isArray(descr.attrs) ? (descr.attrs as [AttrDescr]) : [descr.attrs as AttrDescr]

    let fields: Set<string> = new Set<string>()
    for (const a of attrs) fields.add(a.attr)

    for (const [attr, val] of Object.entries(oo)) {
        if (!fields.has(attr)) {
            const a: string[] = attrs.map(e => e.attr)
            return `${descr.objectname} attribute ${attr} not expected. Expected:${a}`
        }
        const a: AttrDescr = attrs.find(e => e.attr === attr) as AttrDescr
        fields.delete(attr)
        const notvalid: string | undefined = attrValidator(val, a)
        if (notvalid) return `${descr.objectname} attribute ${attr} not valid:${notvalid}`
    }
    // verify required
    for (const f of Array.from(fields.values())) {
        const a: AttrDescr = attrs.find(e => e.attr === f) as AttrDescr
        if (a.required) return `${descr.objectname} attribute ${f} required`
    }
    if (descr.validateC) {
        const notvalid : string|undefined = descr.validateC(oo)
        if (notvalid) return notvalid
    }
    return undefined
}

function validateTypeObject(errmess: string, oo: object, descr: ObjectDescr) {
    const notvalid = objectValidator(oo, descr)
    if (notvalid) internalinfoerrorlog(errmess, notvalid)
}

export default validateTypeObject