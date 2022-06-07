import React, { MutableRefObject, useRef, useState } from "react";

import { IIRefCall } from "./ModalFormDialog";
import ModalFormDialog from "./ModalFormDialog";
import executeAction from '../ts/executeaction'
import { StepsForm, TAction, TAsyncRestCall, TClickButton } from "../ts/typing";
import { FAction, RESTMETH, TComponentProps, TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import RestComponent from "../RestComponent";
import StepsFormView from "./StepsFormView";
import { readvals } from "../ts/readdefs";
import analyzeresponse from "../ts/anayzeresponse";

export type ModalFormProps = ClickActionProps &
{
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

    const ref: MutableRefObject<any> = useRef<IIRefCall>();

    const closeF: FAction = () => {
        setRestView({ visible: false })
    }

    const clickButton: TClickButton = (button?: TAction, row?: TRow) => {
        const res: TComponentProps | undefined = executeAction({ ...props, i: ref.current }, button, row);
        if (res) {
            setRestView({ visible: true, def: { ...res, visible: true, closeAction: closeF } })
        }
    }

    const aRest :TAsyncRestCall = async (h : RESTMETH, r: TRow) => {

        const data : TRow = {...ref.current.getVals(), ...r}
        const dat: any = await readvals(h, data)
        const da = analyzeresponse(dat.data, dat.response)

        return Promise.resolve(da[0])        
    }


    const popDialog: React.ReactNode = restview.visible ? <RestComponent {...restview.def} /> : undefined

    const comp: React.ReactNode = props.isform ? <ModalFormDialog aRest={aRest} vars={(props as ModalFormProps).vars} ref={ref} {...props} clickButton={clickButton} /> : 
                                                 <StepsFormView aRest={aRest} ref={ref} {...props as StepsForm} clickButton={clickButton} />

    return <React.Fragment>
        {comp}
        {popDialog}
    </React.Fragment>
}

export default ModalDialog;