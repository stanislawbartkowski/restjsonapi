import { BreadCrumbAction, FBreadCrumbNotifier, FHeaderNameNotifier, MenuElem } from "./typing";
import { getDomain, isDomain } from "./url";

let notifier: FHeaderNameNotifier | undefined = undefined
let bnotifier: FBreadCrumbNotifier | undefined = undefined

const pathNames = new Map<string, string>()
const menuNames = new Map<string, MenuElem>()

export function dajPathNames(): Map<string, string> {
    return pathNames
}

export function dajMenuNames(): Map<string, MenuElem> {
    return menuNames
}

export function registerNameNotifier(f: FHeaderNameNotifier) {
    notifier = f;
}

export function registerNameBNotifier(f: FBreadCrumbNotifier) {
    bnotifier = f;
}

export function registerName(path: string, name: string) {
    //    const rname: string = isDomain() ? `${getDomain()}/${path}` : `/${path}`
    pathNames.set(path, name)
}

export function registerPElem(path: string, m: MenuElem) {
    menuNames.set(path, m)
}

function removeDomain(path: string): string {
    const beg = isDomain() ? getDomain().length + 1 : 1
    return path.slice(beg)
}

export function pathNotify(path: string) {
    const dpath = removeDomain(path)
    const name: string | undefined = pathNames.get(dpath)
    if (notifier !== undefined) notifier(name)
    BNotify(BreadCrumbAction.RESET, dpath)
}

export const BNotify: FBreadCrumbNotifier = (what: BreadCrumbAction, title?: string) => {
    if (bnotifier === undefined) return
    bnotifier(what, title)
}