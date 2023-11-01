import { ReactNode } from "react";

import { MenuElem, TComponentProps } from "./typing";
import RestComponent from "../components/RestComponent";
import { createRestParam, MenuDirComponent, MenuDirElemComponent } from "../components/MenuComps";
import { isTab } from "./leftmenu";
import { MenuTabComponent } from "../components/TabsMenu";

export type FComponent = () => ReactNode

const menuF: Map<String, FComponent> = new Map<String, FComponent>()

const submenuF: Map<String, FComponent> = new Map<String, FComponent>()


const dirmenu: string[] = []

export function getDirMenuElems() {
    return dirmenu
}

export function addMenuElement(id: string, e: FComponent) {
    menuF.set(id, e)
}


export function addMenuRestElement(p: MenuElem) {
    const pr: TComponentProps = { ...createRestParam(p) }
    // IMPORTANT: <div key> is necessary to force unmount element when Route switch occurs
    const e: FComponent = () => p.menudir ? <MenuDirComponent {...pr} pathid={p.id} /> :
        (isTab(p)) ? <MenuTabComponent {...p} /> :
            <div key={p.id}><RestComponent {...pr} ispage /> </div>

    addMenuElement(p.id, e)
    if (p.menudir) {
        const sube: FComponent = () => <MenuDirElemComponent key={p.id} {...p} />
        dirmenu.push(p.id)
        submenuF.set(p.id, sube)
    }
}

export function getMenuElement(id: string): ReactNode {
    return (menuF.get(id) as FComponent)()
}

export function getMenuDirElement(id: string): ReactNode {
    return (submenuF.get(id) as FComponent)()
}

