import { restaction } from "../../services/api";
import { commonVars, makeMessage } from "../../ts/j";
import { fatalexceptionerror, trace } from "../../ts/l";
import { TRow, OneRowData, HTTPMETHOD, TComponentProps, FieldValue, VAction, RAction } from "../../ts/typing";
import openNotification from "../Notification";
import { IIRefCall } from "../ModalForm/ModalFormDialog";
import { clickAction } from "./helper";
import type { ButtonAction, ClickAction, FieldError, TAction } from "./typing";
import { FAction, ClickActionProps } from '../../ts/typing'
import analyzeresponse from './anayzeresponse'
import { setPrintContent } from './helper'
import defaults from "../../ts/defaults";
import { history } from '../../ts/CustomRouter'
import { ErrorMessages, ErrorMessage } from "../ModalForm/formview/types";

export type IIButtonAction = {
    res: TAction
    ii: IIRefCall
    rr: TRow
    vars: TRow
}

export function createII(b: TAction, vars: TRow, selectedM?: FieldValue): IIButtonAction {
    const rr: TRow = {}
    rr[defaults.multichoicevar] = selectedM
    const res: TAction = clickAction(b, { r: { ...commonVars(), ...rr }, vars: vars })
    const ii: IIRefCall = {
        setMode: function (loading: boolean, errors: ErrorMessages): void {
        },
        getVals: function (): TRow {
            return {}
        },
        setVals: function (r: TRow): void {
        },
        formGetVals: function (): TRow {
            return vars as TRow;
        }
    }
    return { res: res, ii: ii, rr: { ...commonVars(), ...rr }, vars: vars }
}

export function executeB(i: IIButtonAction, refreshaction?: RAction, setvarsaction?: VAction) {
    clickButton({ refreshaction, ...(i.res as ClickAction), i: i.ii, setvarsaction }, i.res, { ...i.rr, ...i.vars })
}

export function ispopupDialog(res: TAction): boolean {
    return res.list !== undefined || res.listdef !== undefined
}

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
            if (r.close) close()
            if (r.notification) openNotification(r.notification, { vars: props.vars, r: t as TRow });
            if (r.refresh && props.refreshaction) props.refreshaction(r)
            if (button?.print) {
                close()
                setPrintContent({ result: r, content: (presult as string), button: (button as ButtonAction) });
                history.push(defaults.displayprintrouterid);
            }
        }
        if (props.i.doAction) props.i.doAction(r)
        if (r.vars) props.i.setVals(r.vars)
    }


    async function dorestaction(res: TAction) {
        props.i.setMode(true, []);
        if (res.restaction) return restaction(res.method as HTTPMETHOD, res.restaction, res.params, t);
        return Promise.resolve(({ data: res, response: undefined }))
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
    dorestaction(res).then(
        ({ data, response }) => {
            const da = analyzeresponse(data, response)
            const reobject: TAction = da[0] as TAction
            const resobject: TAction = (res.retprops) ? Object.assign(reobject, res.retprops) : reobject
            doaction(resobject, da[1])
        }
    ).catch(((e) => {
        fatalexceptionerror(`Error while running ${res.restaction}`, e)
        props.i.setMode(false, []);
        return undefined
    }))
    if (ispopupDialog(res)) return { ...res as TComponentProps }
    return undefined

    /*    
        if (res.restaction) {
            props.i.setMode(true, []);
            restaction(res.method as HTTPMETHOD, res.restaction, res.params, t).then(
                ({ data, response }) => {
                    const da = analyzeresponse(data, response)
                    const reobject: TAction = da[0] as TAction
                    const resobject: TAction = (res.retprops) ? Object.assign(reobject, res.retprops) : reobject
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
        if (ispopupDialog(res)) return { ...res as TComponentProps }
        //if (props.i.doAction) props.i.doAction(res)
        return undefined
    */
}

export default clickButton