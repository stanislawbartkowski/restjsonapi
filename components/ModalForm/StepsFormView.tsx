import React, { useState, forwardRef, useRef, MutableRefObject, useImperativeHandle } from "react"
import { StepProps, Steps } from 'antd'

import type { ClickResult, StepsElem, StepsForm, TClickButton } from "../ts/typing"
import { makeMessage } from "../../ts/j"
import ModalFormDialog, { ErrorMessages, IIRefCall } from "./ModalFormDialog"
import { log } from "../../ts/l"
import { TRow } from "../../ts/typing"

function constructStep(p: StepsElem, key: number, last: boolean): React.ReactNode {

  const title: string = makeMessage(p.title) as string

  const c: StepProps | undefined = last ? { status: 'finish' } : undefined

  return <Steps.Step key={key} title={title} {...p.props} {...c} />
}

type TData = {
  current: number,
  vars?: TRow
}

const StepsComponent = forwardRef<IIRefCall, StepsForm & { clickButton: TClickButton }>((props, iref) => {

  const [c, setCurrent] = useState<TData>({ current: 0 });
  let key: number = 0

  const ref: MutableRefObject<IIRefCall | undefined> = useRef<IIRefCall>();

  function setC(current: number, vars: TRow | undefined) {
    const v: TRow | undefined = ref.current?.getVals();
    setCurrent({ current: current, vars: { ...c.vars, ...v, ...vars } })
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
      const current: number = c.current
      if (b?.next) {
        if (current < props.steps.length - 1) {
          setC(current + 1, b.vars)
        }
        else {
          log("Last step, cannot go forward")
        }
      }
      if (b?.prev) {
        if (current > 0) setC(current - 1, b.vars)
        else {
          log("Beginning, cannot go backward")
        }
      }
    },
    setVals: (r: TRow) => {
      ref.current?.setVals(r)
    }
  })
  )

  return <React.Fragment><Steps current={c.current}>
    {props.steps.map(e => constructStep(e, key++, c.current === props.steps.length - 1))}
  </Steps>
    <ModalFormDialog ref={ref as any} {...props.steps[c.current]} clickButton={props.clickButton} visible ispage initvals={c.vars} />
  </React.Fragment>
})

export default StepsComponent
