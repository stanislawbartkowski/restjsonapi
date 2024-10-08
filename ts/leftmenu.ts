import type { MenuElem, MenuLeft, TMenuNode, TSubMenu } from "./typing";
import { addMenuRestElement, addMenuElement, FComponent } from './constructRestElement'
import { isProd } from "./readresource";
import { istrue } from "../components/ts/helper";
import { registerPElem } from "./headernotifier";


// --------------------
// menu route
// -------------------

function elemInclude(t: TMenuNode): boolean {
    return !(isProd() && istrue(t.isdev))
}

type MenuRoute = {
    rootredirect: string
}

let menuroute: MenuRoute | undefined = undefined

export function setMenuRoute(p: MenuRoute) {
    menuroute = p
}

export function getMenuRoute(): MenuRoute | undefined {
    return menuroute
}
// -----------------------

export function isSubMenu(m: TMenuNode): boolean {
    return (m as TSubMenu).menus !== undefined
}


const addroute: string[] = []

const leftmenu: MenuLeft = { menu: [] }

export function getLeftMenu(): MenuLeft {
    return leftmenu;
}

export function isTab(m: MenuElem): boolean {
    return m.tabs !== undefined && m.tabs.length > 0
}


function getMenuElems(menu: TMenuNode[]): MenuElem[] {
    const res: MenuElem[] = []

    function processMenu(e: TMenuNode) {

        if (isSubMenu(e)) {
            const s: TSubMenu = e as TSubMenu
            s.menus.forEach(e => processMenu(e))
        }
        else {
            const ele: MenuElem = e as MenuElem
            res.push(ele)
            registerPElem(ele.id, ele)
            if (isTab(ele)) ele.tabs?.forEach(e => {
                registerPElem(e.id, ele)
                res.push(e)
            }
            )
        }
    }

    menu.forEach(processMenu)
    return res
}


export function getMenuElemsOnly(): string[] {
    const menulist: MenuElem[] = getMenuElems(leftmenu.menu)
    return menulist.map(e => e.id).concat(addroute)
}

export function addLeftMenuElem(menu: MenuElem, elem: FComponent) {
    leftmenu.menu.push(menu)
    addMenuElement(menu.id, elem)
}

export function addRouterElem(id: string, elem: FComponent) {
    addroute.push(id)
    addMenuElement(id, elem)
}

export function setLeftMenu(lm: MenuLeft) {
    lm.menu.forEach(e => { if (elemInclude(e)) leftmenu.menu.push(e) })
    getMenuElems(lm.menu).forEach(e => addMenuRestElement(e))
}

