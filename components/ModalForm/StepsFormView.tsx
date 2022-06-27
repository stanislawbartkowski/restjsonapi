import React, { useState, forwardRef, useRef, MutableRefObject, useImperativeHandle } from "react"
import { StepProps, Steps } from 'antd'

import type { ButtonAction, ClickResult, StepsElem, StepsForm, TAsyncRestCall, TClickButton } from "../ts/typing"
import { makeMessage } from "../../ts/j"
import ModalFormDialog, { ErrorMessages, IIRefCall } from "./ModalFormDialog"
import { log } from "../../ts/l"
import { TRow } from "../../ts/typing"
import { THooks } from "./TemplateFormDialog"

function constructStep(p: StepsElem, key: number, last: boolean, errorstep: boolean): React.ReactNode {

  const title: string = makeMessage(p.title) as string

  const c: StepProps | undefined = errorstep ? { status: 'error' } : last ? { status: 'finish' } : undefined

  return <Steps.Step key={key} title={title} {...p.props} {...c} />
}

type TData = {
  current: number,
//  vars?: TRow
  errorstep: number | undefined
  // TODO: remove
  aftermove?: boolean
  visited: Set<number>
}

const StepsComponent = forwardRef<IIRefCall, StepsForm & THooks>((props, iref) => {

  const [c, setCurrent] = useState<TData>({ current: 0, errorstep: undefined, visited: new Set<number>() });
  let key: number = 0

  const ref: MutableRefObject<IIRefCall | undefined> = useRef<IIRefCall>();

  function setC(current: number, vars: TRow | undefined, b: ClickResult, visited: Set<number>) {
//    const v: TRow | undefined = ref.current?.getVals();
//    setCurrent({ current: current, vars: { ...c.vars, ...v, ...vars }, errorstep: b.steperror ? current : undefined, aftermove: true, visited: visited })
    setCurrent({ current: current, errorstep: b.steperror ? current : undefined, aftermove: true, visited: visited })
  }

  useImperativeHandle(iref, () => ({
    setMode: (loading: boolean, errors: ErrorMessages) => {
      ref.current?.setMode(loading, errors)
    },
    getVals: () => {
      const ar: TRow | undefined = ref.current?.getVals()
//      return { ...c.vars, ...ar }
      return {...ar }
    },
    doAction: (b: ClickResult) => {
      log(`doaction`)
      let current: number = c.current
      // ---------- refresh global vars
      const va : TRow = ref.current?.formGetVals() as TRow
      if (props.setInitValues) props.setInitValues(va);
      // -----------------------------
      const visited: Set<number> = new Set<number>(c.visited)
      visited.add(current)
      if (b?.next) {
        if (current < props.steps.length - 1) current = current + 1
      } else {
        log("Last step, cannot go forward")
      }

      if (b?.prev) {
        if (current > 0) current = current - 1
        else {
          log("Beginning, cannot go backward")
        }
      }
      setC(current, b.vars, b, visited)
    },
    setVals: (r: TRow) => {
      ref.current?.setVals(r)
    },
    formGetVals : () => {
      return ref.current?.formGetVals() as TRow
    }
  })
  )

//  const clickB: TClickButton = (b?: ButtonAction, row?: TRow) => {
//    const v: TRow | undefined = ref.current?.getVals();
//    if (props.clickButton) props.clickButton(b, { ...v, ...c.vars, ...row })
//  }

//<ModalFormDialog {...props} ref={ref as any} {...props.steps[c.current]} clickButton={clickB} visible ispage initvals={initvals} ignorerestapivals={c.visited.has(c.current)} />

//  const initvals: TRow = { ...props.initvals, ...c.vars }
  const vals : TRow = props.getValues ? props.getValues() : {}
  //const vals: TRow = {}
  const initvals: TRow = { ...props.initvals, ...vals }

  return <React.Fragment><Steps current={c.current}>
    {props.steps.map(e => constructStep(e, key++, c.current === props.steps.length - 1, c.errorstep ? (key - 1) === c.errorstep : false))}
  </Steps>
    <ModalFormDialog {...props} ref={ref as any} {...props.steps[c.current]} visible ispage initvals={initvals} ignorerestapivals={c.visited.has(c.current)} />
  </React.Fragment>
})

export default StepsComponent
