import React, { useState, forwardRef, useRef, MutableRefObject, useImperativeHandle } from "react"
import { StepProps, Steps } from 'antd'

import type { ButtonAction, ClickResult, StepsElem, StepsForm, TClickButton } from "../ts/typing"
import { makeMessage } from "../../ts/j"
import ModalFormDialog, { ErrorMessages, IIRefCall } from "./ModalFormDialog"
import { log } from "../../ts/l"
import { TRow } from "../../ts/typing"

function constructStep(p: StepsElem, key: number, last: boolean, errorstep: boolean): React.ReactNode {

  const title: string = makeMessage(p.title) as string

  const c: StepProps | undefined = errorstep ? { status: 'error' } : last ? { status: 'finish' } : undefined

  return <Steps.Step key={key} title={title} {...p.props} {...c} />
}

type TData = {
  current: number,
  vars?: TRow
  errorstep: number | undefined
  aftermove?: boolean
}

const StepsComponent = forwardRef<IIRefCall, StepsForm & { clickButton: TClickButton }>((props, iref) => {

  const [c, setCurrent] = useState<TData>({ current: 0, errorstep: undefined });
  let key: number = 0

  const ref: MutableRefObject<IIRefCall | undefined> = useRef<IIRefCall>();

  function setC(current: number, vars: TRow | undefined, b: ClickResult) {
    const v: TRow | undefined = ref.current?.getVals();
    setCurrent({ current: current, vars: { ...c.vars, ...v, ...vars }, errorstep: b.steperror ? current : undefined, aftermove : true })
  }

  useImperativeHandle(iref, () => ({
    setMode: (loading: boolean, errors: ErrorMessages) => {
      ref.current?.setMode(loading, errors)
    },
    getVals: () => {
      const ar: TRow | undefined = ref.current?.getVals()
      return { ...c.vars, ...ar }
    },
    doAction: (b: ClickResult) => {
      log(`doaction`)
      let current: number = c.current
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
      setC(current, b.vars, b)
    },
    setVals: (r: TRow) => {
      ref.current?.setVals(r)
    }
  })
  )

  const clickB: TClickButton = (b?: ButtonAction, row?: TRow) => {
    props.clickButton(b, { ...c.vars, ...row })
  }

  return <React.Fragment><Steps current={c.current}>
    {props.steps.map(e => constructStep(e, key++, c.current === props.steps.length - 1, c.errorstep ? (key - 1) === c.errorstep : false))}
  </Steps>
    <ModalFormDialog ref={ref as any} {...props.steps[c.current]} clickButton={clickB} visible ispage initvals={c.vars} ignorerestapivals={c.aftermove} />
  </React.Fragment>
})

export default StepsComponent
