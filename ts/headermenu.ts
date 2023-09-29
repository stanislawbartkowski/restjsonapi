import { emptys } from "../components/ts/helper";
import { restaction } from "../services/api";
import { readR } from "../services/readconf";
import defaults from "./defaults";
import { HTTPMETHOD } from "./typing";

export type HeaderMenu = {
    name: string,
    url: string
}

let headerMenu: HeaderMenu[] | undefined

export function getHeaderMenu(): HeaderMenu[] | undefined {
    return headerMenu
}

export async function readHeaderMenu() {


    const url = await readR(defaults.headermenuresource)

    if (emptys(url)) return Promise.resolve()
    const js = {
        "url": url
        //"test": true
    }
    const data = await restaction(HTTPMETHOD.POST, defaults.headermenuaction, undefined, js)
    headerMenu = data.data.res
}

