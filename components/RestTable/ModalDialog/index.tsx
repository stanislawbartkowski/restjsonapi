import React, { MutableRefObject, useRef } from "react";

import type { ModalDialogProps, ClickResult, ButtonAction, TRow, ActionResult, FieldError, TCloseFunction } from '../typing'
import ModalForm, { IIRefCall, ErrorMessages, ErrorMessage } from "../ModalForm";
import { trace } from "../../../ts/l";
import { clickAction, makeMessage } from '../js/helper'
import { restaction } from '../../../services/api'
import { HTTPMETHOD } from "../../../ts/typing";
import validateObject, { ObjectType } from '../js/validateobject'

function ltrace(mess: string) {
    trace('HeaderTable', mess)
}

function transformError(e: FieldError, r?: TRow): ErrorMessage {
    const mess: string = makeMessage(e.err, r) as string
    ltrace(`${e.field} error message: ${mess}`)
    return { field: e.field, message: mess }
}

function transformErrors(err: FieldError[], r?: TRow): ErrorMessages {

    const e: ErrorMessages = err.map(e => transformError(e, r))
    return e
}


// const ModalForm = forwardRef<IIRefCall, ModalListProps>
const ModalDialog : React.FC<ModalDialogProps> = (props) => {

    const ref: MutableRefObject<any> = useRef<IIRefCall>();

    const clickButton = (button?: ButtonAction, t?: TRow) => {
            function close() {
                (props.closeModal as TCloseFunction)(button, t)
            }
            ltrace(`Form button clicked ${button?.id}`)
            if (button === undefined) {
                close()
                return;
            }
            const res: ClickResult = clickAction(button, t)
            if (res.close) close()
            if (res.restaction) {
                ref.current.setLoadingMode(true);
                restaction(res.method as HTTPMETHOD, res.restaction, res.params, t).then(
                    (resobject) => {
                        validateObject(ObjectType.ACTIONRESULT, `Result ${res.restaction}`, resobject)
                        const r: ActionResult = resobject as ActionResult
                        if (r.error) {
                            (ref.current as IIRefCall).setErrorMessage(transformErrors(r.error, t))
                        } else {
                            close()
                            props.refresh()
                        }
                    }
                )
                    .finally(() => ref.current.setLoadingMode(false));
            }
        }

    return <ModalForm ref={ref} {...props} closeModal={clickButton} />
}

export default ModalDialog;
