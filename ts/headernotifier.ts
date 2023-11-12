import { FHeaderNameNotifier } from "./typing";

let notifier: FHeaderNameNotifier | undefined = undefined

const pathNames = new Map<string, string>()

export function registerNameNotifier(f: FHeaderNameNotifier) {
    notifier = f;
}

export function registerName(path: string, name: string) {
    pathNames.set("/" + path, name)
}

export function pathNotify(path: string) {
    if (notifier === undefined) return
    const name: string | undefined = pathNames.get(path)
    notifier(name)
}