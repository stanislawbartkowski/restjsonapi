import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { blue, cyan, green, yellow, gold, purple } from '@ant-design/colors';
import React, { useState } from 'react';

import { extractActionHook, IActionHook } from "./transcol"
import { TableHookParam, TAction } from './typing';
import { OneRowData } from '../../ts/typing';
import { emptys } from './helper';

const colors: string[] = [blue[6], cyan[6], green[6], yellow[7], gold[6], purple[5]]

function StackButton({ idx, t, r, pars }: { idx: number; t: TAction; r: TableHookParam; pars: OneRowData }) {
    const [loading, setLoading] = useState(false)
    const h: IActionHook = extractActionHook(t, r, pars)

    if (emptys(h.text)) return null

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setLoading(true)
        await h.onClick()
        setLoading(false)
    }

    return <Button
        icon={<LoadingOutlined style={{ visibility: loading ? 'visible' : 'hidden' }} />}
        onClick={handleClick}
        style={{ border: "0", margin: "4px", backgroundColor: colors[idx % colors.length], color: "white" }}>
        {h.text}
    </Button>
}

export function toButton(i: number, t: TAction, r: TableHookParam, pars: OneRowData) {
    return <StackButton key={i} idx={i} t={t} r={r} pars={pars} />
}