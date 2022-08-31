import React, { ReactNode } from "react";

import { MenuElem, TComponentProps } from "./typing";
import RestComponent from "../components/RestComponent";
import { createRestParam, MenuDirComponent, MenuDirElemComponent } from "../components/MenuComps";
import InLine from "./inline";

const menuF: Map<String, ReactNode> = new Map<String, ReactNode>()

const submenuF: Map<String, ReactNode> = new Map<String, ReactNode>()

const dirmenu: string[] = []

export function getDirMenuElems() {
    return dirmenu
}

export function addMenuElement(id: string, e: ReactNode) {
    menuF.set(id, e)
}


export function addMenuRestElement(p: MenuElem) {
    const pr: TComponentProps = { ...createRestParam(p) }
    const e: ReactNode = p.menudir ? <MenuDirComponent {...pr} ispage pathid={p.id} /> : <RestComponent {...pr} ispage />
    addMenuElement(p.id, e)
    if (p.menudir) {
        const sube: ReactNode = <MenuDirElemComponent key={p.id} {...p} />
        dirmenu.push(p.id)
        submenuF.set(p.id, sube)
    }
}

export function getMenuElement(id: string): ReactNode {
    return menuF.get(id)
}

export function getMenuDirElement(id: string): ReactNode {
    return submenuF.get(id)
}

