import React, { MutableRefObject, useRef } from "react";

import type { ModalDialogProps, ClickResult, ButtonAction, TRow, ActionResult, FieldError, TCloseFunction } from '../typing'
import ModalForm, { IIRefCall, ErrorMessages, ErrorMessage } from "../ModalForm";
import { clickAction, makeMessage } from '../js/helper'
import { restaction } from '../../../services/api'
import { HTTPMETHOD } from "../../../ts/typing";
import validateObject, { ObjectType } from '../js/validateobject'
import openNotification from "../Notification";
import { trace, fatalexceptionerror } from '../../../ts/l'
import {isEmpty} from '../../../ts/j'

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


const ModalDialog: React.FC<ModalDialogProps> = (props) => {

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
                    ltrace("REST/API returned, validate the action result")
                    validateObject(ObjectType.ACTIONRESULT, `Result ${res.restaction}`, resobject)
                    ltrace("Action result")
                    const r: ActionResult = isEmpty(resobject) ? res : resobject as ActionResult 
                    if (r.error) {
                        (ref.current as IIRefCall).setErrorMessage(transformErrors(r.error, t))
                    } else {
                        close()

                        if (r.notification) openNotification(r.notification, t);
                        props.refresh()
                    }
                }
            ).catch(((e) => {
                fatalexceptionerror(`Error while running ${res.restaction}`,e)
            })

            )
                .finally(() => ref.current.setLoadingMode(false));
        }
    }

    return <ModalForm ref={ref} {...props} closeModal={clickButton} />
}

export default ModalDialog;
