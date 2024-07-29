import { ReactNode } from "react";
import { Collapse } from "antd";

import { isString, makeMessage } from "../../../ts/j";
import { TRow } from "../../../ts/typing";
import { TCookie, TPanel } from "../../ts/typing";
import { ErrorMessages, FField, IFieldContext } from "./types";
import { produceBody } from './FormBody';
import { elemFactory } from "./EditItems";
import { emptys } from "../../ts/helper";


const addf: string = "collapes"

function getActiveKeys(ir: IFieldContext, t: FField): string[] {
    const s = ir.fReadCookie(t, addf)
    if (emptys(s)) return []
    const active: string[] = JSON.parse(s as string)
    return active
}

function producePanel(ir: IFieldContext, p: TPanel, err: ErrorMessages, r: TRow, eFactory: elemFactory): React.ReactNode {

    const header: string | undefined = makeMessage(p.header, { r: r })
    const panelnode: ReactNode = produceBody(p.items, eFactory)

    return <Collapse.Panel header={header} key={p.key} {...p.props}>{panelnode}</Collapse.Panel>

}

export function createCollapsePanels(ir: IFieldContext, t: FField, err: ErrorMessages, eFactory: elemFactory): React.ReactNode {

    const r: TRow = ir.getValues()

    const activeKeys: string[] = getActiveKeys(ir, t)

    const onChange = (key: string | string[]) => {
        const k: string[] = isString(key) ? [key as string] : key as string[]
        const s: string = JSON.stringify(k)
        ir.fWriteCookie(t, s, addf)
    }


    return <Collapse {...t.props} defaultActiveKey={activeKeys} onChange={onChange}>
        {t.collapse?.map(p => producePanel(ir, p, err, r, eFactory as elemFactory))}
    </Collapse>
}