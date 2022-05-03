import React, { MutableRefObject, useRef } from "react";

import type { ModalDialogProps, TCloseFunction } from '../../ts/typing'
import ModalForm, { IIRefCall, ErrorMessages, ErrorMessage } from "../../ModalForm";
import { restaction } from '../../../services/api'
import { HTTPMETHOD, OneRowData, TRow } from "../../../ts/typing";
import openNotification from "../Notification";
import { trace, fatalexceptionerror } from '../../../ts/l'
import { isEmpty } from '../../../ts/j'
import { clickAction, makeMessage } from "../../ts/helper";
import { FieldError, ButtonAction, ClickResult, ActionResult } from "../../ts/typing";
import validateObject, { ObjectType } from "../../ts/validateobject";

function ltrace(mess: string) {
    trace('HeaderTable', mess)
}

function transformError(e: FieldError, pars: OneRowData): ErrorMessage {
    const mess: string = makeMessage(e.err, pars) as string
    ltrace(`${e.field} error message: ${mess}`)
    return { field: e.field, message: mess }
}

function transformErrors(err: FieldError[], pars: OneRowData): ErrorMessages {

    const e: ErrorMessages = err.map(e => transformError(e, pars))
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
        function toPars(): OneRowData {
            return { vars: props.vars, r: t as TRow }
        }
        const res: ClickResult = clickAction(button, toPars())
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
                        (ref.current as IIRefCall).setErrorMessage(transformErrors(r.error, toPars()))
                    } else {
                        close()

                        if (r.notification) openNotification(r.notification, { vars: props.vars, r: t as TRow });
                        props.refresh()
                    }
                }
            ).catch(((e) => {
                fatalexceptionerror(`Error while running ${res.restaction}`, e)
            })

            )
                .finally(() => ref.current.setLoadingMode(false));
        }
    }

    return <ModalForm ref={ref} {...props} closeModal={clickButton} />
}

export default ModalDialog;
