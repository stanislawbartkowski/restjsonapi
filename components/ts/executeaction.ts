import { restaction } from "../../services/api";
import { isEmpty, makeMessage } from "../../ts/j";
import { fatalexceptionerror, trace } from "../../ts/l";
import { TRow, OneRowData, HTTPMETHOD, TComponentProps } from "../../ts/typing";
import openNotification from "../Notification";
import { ErrorMessage, ErrorMessages, IIRefCall } from "../ModalForm/ModalFormDialog";
import { clickAction } from "./helper";
import type { ActionResult, ButtonAction, ClickResult, FieldError } from "./typing";
import validateObject, { ObjectType } from "./validateobject";
import { FAction, ClickActionProps } from '../../ts/typing'
import analyzeresponse from './anayzeresponse'
import { setPrintContent } from './helper'
import defaults from "../../ts/defaults";
import { history } from '../../ts/CustomRouter'

function ltrace(mess: string) {
    trace('ClickButton', mess)
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

interface IClickParams extends ClickActionProps {
    vars?: TRow
    i: IIRefCall
}

function clickButton(props: IClickParams, button?: ButtonAction, t?: TRow): TComponentProps | undefined {


    const close: FAction = () => {
        if (props.closeAction) props.closeAction()
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
        props.i.setMode(true, []);
        restaction(res.method as HTTPMETHOD, res.restaction, res.params, t).then(
            ({ data, response }) => {
                const da = analyzeresponse(data, response)
                const resobject: ActionResult = da[0]
                ltrace("REST/API returned, validate the action result")
                validateObject(ObjectType.ACTIONRESULT, `Result ${res.restaction}`, resobject)
                ltrace("Action result")
                const r: ActionResult = isEmpty(resobject) ? res : resobject as ActionResult
                if (r.error) {
                    props.i.setMode(false, transformErrors(r.error, toPars()))
                } else {
                    props.i.setMode(false, []);
                    close()

                    if (r.notification) openNotification(r.notification, { vars: props.vars, r: t as TRow });
                    if (props.refresh) props.refresh()
                    if (button.print) {
                        setPrintContent({ result: resobject, content: (da[1] as string), button: (button as ButtonAction) });
                        history.push(defaults.displayprintrouterid);
                    }
                }
            }
        ).catch(((e) => {
            fatalexceptionerror(`Error while running ${res.restaction}`, e)
            props.i.setMode(false, []);
        })

        )
        return undefined
    }
    if (res.list || res.listdef) return { ...res }
    return undefined
}

export default clickButton