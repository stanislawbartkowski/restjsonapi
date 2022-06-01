import { restaction } from "../../services/api";
import { makeMessage } from "../../ts/j";
import { fatalexceptionerror, trace } from "../../ts/l";
import { TRow, OneRowData, HTTPMETHOD, TComponentProps } from "../../ts/typing";
import openNotification from "../Notification";
import { ErrorMessage, ErrorMessages, IIRefCall } from "../ModalForm/ModalFormDialog";
import { clickAction } from "./helper";
import type { ActionResult, ButtonAction, FieldError, TAction } from "./typing";
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

function clickButton(props: IClickParams, button?: TAction, t?: TRow): TComponentProps | undefined {


    function doaction(r: TAction, presult?: string) {
//        ltrace("REST/API returned, validate the action result")
//        validateObject(ObjectType.ACTIONRESULT, `Result ${res.restaction}`, r)
//        ltrace("Action result")
        if (r.error) {
            props.i.setMode(false, transformErrors(r.error, toPars()))
        } else {
            props.i.setMode(false, []);
            close()
            if (r.notification) openNotification(r.notification, { vars: props.vars, r: t as TRow });
            if (props.refresh) props.refresh()
            if (button?.print) {
                setPrintContent({ result: r, content: (presult as string), button: (button as ButtonAction) });
                history.push(defaults.displayprintrouterid);
            }
        }
        if (props.i.doAction) props.i.doAction(r)
        if (r.vars) props.i.setVals(r.vars)
    }

    const close: FAction = () => {
        if (props.closeAction) props.closeAction()
    }
    ltrace('clickButton function')
    if (button === undefined) {
        close()
        return;
    }
    function toPars(): OneRowData {
        return { vars: props.vars, r: t as TRow }
    }
    const res: TAction = clickAction(button, toPars())
    if (res.close) close()
    if (res.restaction) {
        props.i.setMode(true, []);
        restaction(res.method as HTTPMETHOD, res.restaction, res.params, t).then(
            ({ data, response }) => {
                const da = analyzeresponse(data, response)
                const resobject: ActionResult = da[0]
                doaction(resobject, da[1])
            }
        ).catch(((e) => {
            fatalexceptionerror(`Error while running ${res.restaction}`, e)
            props.i.setMode(false, []);
        })
        )
        return undefined
    }
    doaction(res)
    if (res.list || res.listdef) return { ...res }
    //if (props.i.doAction) props.i.doAction(res)
    return undefined
}

export default clickButton