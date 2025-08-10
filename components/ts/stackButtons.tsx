import { Button } from 'antd';
import { blue, cyan, green, yellow, gold, purple } from '@ant-design/colors';

import { extractActionHook, IActionHook } from "./transcol"
import { TableHookParam, TAction } from './typing';
import { OneRowData } from '../../ts/typing';
import { emptys } from './helper';

export function toButton(i: number, t: TAction, r: TableHookParam, pars: OneRowData) {

    const h: IActionHook = extractActionHook(t, r, pars)

    const colors: string[] = [blue[6], cyan[6], green[6], yellow[7], gold[6], purple[5]]

    if (emptys(h.text)) return undefined

    return <Button
        key={i}
        onClick={h.onClick}
        style={{ border: "0", margin: "4px", backgroundColor: colors[i % colors.length], color: "white" }}>
        {h.text}
    </Button>
}