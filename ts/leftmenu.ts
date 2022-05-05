import type { MenuElem, MenuLeft, TMenuNode, TSubMenu } from "./typing";
import { addMenuRestElement, addMenuElement } from './constructRestElement'
import { ReactNode } from "react";


// --------------------
// menu route
// -------------------

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


function getMenuElems(menu: TMenuNode[]): MenuElem[] {
    const res: MenuElem[] = []

    function processMenu(e: TMenuNode) {

        if (isSubMenu(e)) {
            const s: TSubMenu = e as TSubMenu
            s.menus.forEach(e => processMenu(e))
        }
        else res.push(e as MenuElem)
    }

    menu.forEach(processMenu)

    return res
}


export function getMenuElemsOnly(): string[] {
    const menulist : MenuElem[] = getMenuElems(leftmenu.menu)
    return menulist.map( e => e.id).concat(addroute)
}

export function addLeftMenuElem(menu: MenuElem, elem: ReactNode) {
    leftmenu.menu.push(menu)
    addMenuElement(menu.id, elem)
}

export function addRouterElem(id: string, elem: ReactNode) {
    addroute.push(id)
    addMenuElement(id, elem)
}

export function setLeftMenu(lm: MenuLeft) {
    lm.menu.forEach(e => leftmenu.menu.push(e))
    getMenuElems(lm.menu).forEach(e => addMenuRestElement(e))
}

