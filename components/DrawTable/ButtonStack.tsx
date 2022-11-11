import { Button } from "antd"
import React from "react"

import { OneRowData } from "../../ts/typing"
import { extractActionHook, getActions, IActionHook } from "../ts/transcol"
import { TableHookParam, TAction, TActions, TColumn, TColumns } from "../ts/typing"
import { blue, cyan, green, yellow, gold, purple } from '@ant-design/colors';

function toButton(i: number, t: TAction, r: TableHookParam, pars: OneRowData) {

  const h: IActionHook = extractActionHook(t, r, pars)

  const colors: string[] = [blue[6], cyan[6], green[6], yellow[7], gold[6], purple[5]]

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

  function getListOfActions(t: TColumn): TAction[] {
    const act: TActions = getActions(t.actions as TActions, props.pars)
    return act === undefined ? [] : act.actions as TAction[]
  }

  const a: TAction[] = acols.reduce((prev: TAction[], act: TColumn) => [...prev, ...getListOfActions(act)], [])

  let i = 0

  return <React.Fragment>
    {a.map(e => toButton(i++, e, props.r, props.pars))}
  </React.Fragment>

}

export default ButtonStack