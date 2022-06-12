import React, { MutableRefObject, useRef, useState } from "react";

import { IIRefCall } from "./ModalFormDialog";
import ModalFormDialog from "./ModalFormDialog";
import executeAction from '../ts/executeaction'
import { FGetValues, FSetValues, StepsForm, TAction, TAsyncRestCall, TClickButton } from "../ts/typing";
import { FAction, RESTMETH, TComponentProps, TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import RestComponent from "../RestComponent";
import StepsFormView from "./StepsFormView";
import { readvalsdata } from "../ts/readdefs";

export type THooks = {
    aRest: TAsyncRestCall,
    clickButton: TClickButton
    getValues: FGetValues
    setInitValues: FSetValues
}

type ModalFormProps = ClickActionProps & {
    visible?: boolean
    ispage?: boolean
    vars?: TRow
}

type PopDialogView = {
    def?: TComponentProps
    visible: boolean
}

const ModalDialog: React.FC<(ModalFormProps | StepsForm) & { isform: boolean }> = (props) => {

    const [restview, setRestView] = useState<PopDialogView>({ visible: false });

    const [initvals, setInitVals] = useState<TRow>({...props.vars});


    const ref: MutableRefObject<any> = useRef<IIRefCall>();

    const closeF: FAction = () => {
        setRestView({ visible: false })
    }

    const clickButton: TClickButton = (button?: TAction, row?: TRow) => {
        const res: TComponentProps | undefined = executeAction({ ...props, i: ref.current }, button, row);
        console.log(row)
        if (res) {
            setRestView({ visible: true, def: { ...res, visible: true, closeAction: closeF } })
        }
    }

    const aRest: TAsyncRestCall = async (h: RESTMETH, r: TRow) => {

        const data: TRow = { ...initvals, ...ref.current.getVals(), ...r }
        return readvalsdata(h, data)
    }

    const thooks: THooks = {
        aRest: aRest,
        clickButton: clickButton,
        getValues: () => {
            const r: TRow = { ...initvals, ...ref.current?.getVals() }
            return r
        },
        setInitValues: (r: TRow) => {
            const ar: TRow = { ...initvals, ...r }
            setInitVals({...ar})
        }
    }


    const popDialog: React.ReactNode = restview.visible ? <RestComponent {...restview.def} /> : undefined

    const comp: React.ReactNode = props.isform ? <ModalFormDialog {...thooks} ref={ref} {...props} /> :
        <StepsFormView {...thooks} ref={ref} vars={(props as ModalFormProps).vars} {...props as StepsForm} initvals={initvals} />

    return <React.Fragment>
        {comp}
        {popDialog}
    </React.Fragment>
}

export default ModalDialog;