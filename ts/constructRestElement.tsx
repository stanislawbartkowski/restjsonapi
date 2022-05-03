import { ReactNode } from "react";
import RestTable from "../components/RestTable";
import { MenuElem, RestTableParam } from "./typing";
import ModalForm from '../components/ModalForm'

const menuF: Map<String, ReactNode> = new Map<String, ReactNode>()

let resttableProps: RestTableParam = {}

export function setRestTableProps(p: RestTableParam) {
    resttableProps = p
}

export function addMenuElement(id: string, e: ReactNode) {
    menuF.set(id, e)
}


function isForm(p: MenuElem): boolean {
    return (p.listdef !== undefined && p.list === undefined)
}

export function addMenuRestElement(p: MenuElem) {
    const e: ReactNode = isForm(p) ? <ModalForm {...p} ispage visible /> :
        <RestTable {...p} list={p.list ? p.list : p.id} {...resttableProps} />
    addMenuElement(p.id, e)
}

export function getMenuElement(id: string): ReactNode {
    return menuF.get(id)
}