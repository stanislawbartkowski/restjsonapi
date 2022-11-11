import { Button } from "antd"
import React from "react"

import { OneRowData } from "../../ts/typing"
import { extractActionHook, IActionHook } from "../ts/transcol"
import { TableHookParam, TAction, TColumn, TColumns } from "../ts/typing"
import { blue, cyan, green, yellow, gold } from '@ant-design/colors';

function toButton(i: number, t: TAction, r: TableHookParam, pars: OneRowData) {

  const h: IActionHook = extractActionHook(t, r, pars)

  const colors: string[] = [blue[6], cyan[6], green[6], yellow[7], gold[6]]

  return <Button
    key={i}
    onClick={h.onClick}
    style={{ border: "0", margin: "4px", backgroundColor: colors[i % colors.length], color: "white" }}>
    {h.text}
  </Button>
}

interface ButtonStackPars {
  cols: TColumns,
  r: TableHookParam,
  pars: OneRowData
}


const ButtonStack: React.FC<ButtonStackPars> = (props) => {

  const acols: TColumn[] = props.cols.filter(e => e.actions)

  if (acols.length == 0) return <React.Fragment></React.Fragment>

  const a: TAction[] = acols.reduce((prev: TAction[], act: TColumn) => [...prev, ...act.actions?.actions as TAction[]], [])

  let i = 0

  return <React.Fragment>
    {a.map(e => toButton(i++, e, props.r, props.pars))}
  </React.Fragment>

}

export default ButtonStack