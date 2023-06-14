import { restaction } from "../../services/api";
import { commonVars, makeMessage } from "../../ts/j";
import { fatalexceptionerror, log, trace } from "../../ts/l";
import { TRow, OneRowData, HTTPMETHOD, TComponentProps, FieldValue, VAction, RAction } from "../../ts/typing";
import openNotification from "../Notification";
import { IIRefCall } from "../ModalForm/ModalFormDialog";
import { clickAction, istrue } from "./helper";
import { NotificationKind, type ButtonAction, type ClickAction, type FRereadRest, type FRetAction, type FSetValues, type FieldError, type TAction, type TNotification } from "./typing";
import { FAction, ClickActionProps } from '../../ts/typing'
import analyzeresponse from './anayzeresponse'
import { setPrintContent } from './helper'
import defaults from "../../ts/defaults";
import { history } from '../../ts/CustomRouter'
import { ErrorMessages, ErrorMessage } from "../ModalForm/formview/types";
import fileDownload from "js-file-download";
import { RequestOptionsInit } from "umi-request";

export type IIButtonAction = {
    res: TAction
    ii: IIRefCall
    rr: TRow
    vars: TRow
}

export function createII(b: TAction, vars: TRow, selectedM?: FieldValue, retAction?: FRetAction, rereadRest?: FRereadRest, setvarsaction?: VAction): IIButtonAction {
    const rr: TRow = {}
    rr[defaults.multichoicevar] = selectedM
    const res: TAction = clickAction(b, { r: { ...commonVars(), ...rr }, vars: vars })
    const ii: IIRefCall = {
        setMode: function (loading: boolean, errors: ErrorMessages): void {
        },
        getVals: function (): TRow {
            return {};
        },
        setVals: function (r: TRow): void {
            if (setvarsaction !== undefined) setvarsaction(r)
        },
        formGetVals: function (): TRow {
            return vars as TRow;
        },
    }
    if (retAction !== undefined) {
        ii.retAction = retAction
    }
    if (rereadRest !== undefined) {
        ii.rereadRest = rereadRest
    }
    return { res: res, ii: ii, rr: { ...commonVars(), ...rr }, vars: vars }
}

export function executeB(i: IIButtonAction, rereadRest?: FRereadRest, refreshaction?: RAction, setvarsaction?: VAction, closeAction?: FAction) {
    clickButton({ refreshaction, ...(i.res as ClickAction), i: i.ii, setvarsaction, rereadRest, closeAction }, i.res, { ...i.rr, ...i.vars })
}

export function ispopupDialog(res: TAction): boolean {
    return res.list !== undefined || res.listdef !== undefined
}

function ltrace(mess: string) {
    trace('ClickButton', mess)
}

function transformError(e: FieldError, pars: OneRowData): ErrorMessage {
    const mess: string = makeMessage(e.err, pars) as string
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

    function download(res: TAction, t: any, presult: any) {
        const d: string | undefined = res.vars !== undefined ? res.vars[defaults.downloadname] as string : undefined
        const downloadname: string = (d !== undefined) ? d : defaults.defaultdownloadname
        fileDownload(t as ArrayBuffer, downloadname)
        const noti: TNotification = {
            kind: NotificationKind.SUCCESS,
            title: { message: "filedownloaded" },
            description: { messagedirect: downloadname }
        }
        openNotification(noti, { r: {} })
    }

    function doaction(r: TAction, presult?: string) {
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
        if (istrue(r.rereadrest) && props.i.rereadRest !== undefined) props.i.rereadRest()
        if (r.retprops && props.i.retAction) props.i.retAction(r.retprops, r.retprops.vars as TRow)
    }


    async function dorestaction(res: TAction, responseType?: RequestOptionsInit["responseType"]) {
        props.i.setMode(true, []);
        if (res.restaction) return restaction(res.method as HTTPMETHOD, res.restaction, res.params, t, responseType);
        return Promise.resolve(({ data: res, response: undefined }))
    }

    const close: FAction = () => {
        if (props.closeAction) props.closeAction()
    }
    if (button === undefined) {
        close()
        return;
    }
    function toPars(): OneRowData {
        return { vars: props.vars, r: t as TRow }
    }
    const res: TAction = clickAction(button, toPars())
    if (res.close) close()
    dorestaction(res, istrue(res.download) ? "arrayBuffer" : undefined).then(
        ({ data, response }) => {
            const da = analyzeresponse(data, response)
            const reobject: TAction = da[0] as TAction
            const resobject: TAction = (res.retprops) ? Object.assign(reobject, res.retprops) : reobject
            if (istrue(res.download)) download(res, resobject, da[1])
            else doaction(resobject, da[1])
        }
    ).catch(((e) => {
        fatalexceptionerror(`Error while running ${res.restaction}`, e)
        props.i.setMode(false, []);
        return undefined
    }))
    if (ispopupDialog(res)) return { ...res as TComponentProps }
    return undefined
}

export default clickButton