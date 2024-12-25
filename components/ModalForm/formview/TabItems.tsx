import { makeMessage } from "../../../ts/j";
import { TRow } from "../../../ts/typing";
import { TabItems } from "../../ts/typing";
import { ErrorMessages, FField, IFieldContext } from "./types";
import { produceBody } from './FormBody';
import { ReactNode } from "react";
import { elemFactory } from "./EditItems";
import { Tabs } from "antd";
import { getCookieValue, saveCookieValue } from "./helper";
import defaults from "../../../ts/defaults";


function produceTabItem(ir: IFieldContext, p: TabItems, err: ErrorMessages, r: TRow, eFactory: elemFactory): ReactNode {

    const label: string = makeMessage(p.label, { r: r }) as string
    const panelnode: ReactNode = produceBody(ir, p.items, eFactory) as ReactNode

    return <Tabs.TabPane tab={label} key={p.key}>
        {panelnode}
    </Tabs.TabPane>

}

function getdefkey(ir: IFieldContext, t: FField, r: TRow) {
    const defaultActiveKey: string | undefined = getCookieValue(ir, t, t.tab?.defaultActiveKey)

    const defaKey = defaultActiveKey === undefined ? undefined : { defaultActiveKey: defaultActiveKey }
    const varkey: string | undefined = defaults.settabprefix + t.field
    return r[varkey] === undefined ? defaKey : { defaultActiveKey: r[varkey] as string }
}

export function createTabsPanel(ir: IFieldContext, t: FField, err: ErrorMessages, eFactory: elemFactory): React.ReactNode {

    const r: TRow = ir.getValues()

    const defaKey = getdefkey(ir, t, r)

    const onChange = (activekey: string) => {
        saveCookieValue(ir, t, t.tab?.defaultActiveKey, activekey)
        ir.fieldChanged(t, activekey)
    }

    return <Tabs {...defaKey} {...t.tab?.props} onChange={onChange}>
        {t.tab?.tabs.map(p => produceTabItem(ir, p, err, r, eFactory as elemFactory))}
    </Tabs>
}