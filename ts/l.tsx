import { getLogger } from './LogConfig'

export const logG = getLogger('')

export function log(s: string) {
    logG.info(s)
}

export function trace(module: string, mess: string) {
    logG.debug(`[${module}] ${mess}`);
}

export function erralert(mess: string) {
    alert(mess);
}

export function internalerrorlog(mess: string, alert: boolean = true) {
    const emess: string = `Internal error : ${mess}`;
    logG.fatal(()=> emess)
    if (alert) erralert(emess);
}

export function internalinfoerrorlog(info: string, errmess: string, alert: boolean = true) {
    const emess: string = `${info}  Internal error : ${errmess}`;
    logG.fatal(() => emess);
    if (alert) erralert(emess);
}
