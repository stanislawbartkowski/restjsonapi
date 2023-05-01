import { makeMessage } from "../../../ts/j";
import { TRow } from "../../../ts/typing";
import { TPanel } from "../../ts/typing";
import { ErrorMessages, FField, IFieldContext } from "./types";
import { produceBody } from './FormBody';
import { ReactNode } from "react";
import { elemFactory } from "./EditItems";
import { Collapse, } from "antd";


function producePanel(ir: IFieldContext, p: TPanel, err: ErrorMessages, r: TRow, eFactory: elemFactory): React.ReactNode {

    const header: string | undefined = makeMessage(p.header, { r: r })
    const panelnode: ReactNode = produceBody(p.items, eFactory)

    return <Collapse.Panel header={header} key={p.key} {...p.props}>{panelnode}</Collapse.Panel>

}

export function createCollapsePanels(ir: IFieldContext, t: FField, err: ErrorMessages, eFactory: elemFactory): React.ReactNode {

    const r: TRow = ir.getValues()


    return <Collapse {...t.props}>
        {t.collapse?.map(p => producePanel(ir, p, err, r, eFactory as elemFactory))}
    </Collapse>
}