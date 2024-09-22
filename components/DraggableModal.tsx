import { Modal } from "antd";
import React, { CSSProperties, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { BreadCrumbAction, PropsType } from "../ts/typing";
import { emptys } from "./ts/helper";
import { HTMLElem } from "./ts/transcol";
import { BNotify } from "../ts/headernotifier";
import { log } from "../ts/l";

type DraggablePros = {
    title?: string
    open: boolean
    onClose: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
    onOk?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
    modalprops?: PropsType
    buttons: ReactNode
    children: React.ReactNode
}

interface IBreadSend {
    send: boolean
}

const ModalDialog: React.FC<DraggablePros> = (props) => {

    const draggleRef = useRef<HTMLDivElement>(null);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const [disabled, setDisabled] = useState(true);

    const ref: MutableRefObject<IBreadSend> = useRef<IBreadSend>({ send: false }) as MutableRefObject<IBreadSend>


    const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    const style: CSSProperties = {
        width: 'calc(100% - 12px)',
        cursor: 'move',
        background: '#f3f4e2',
        padding: '5px',
        borderRadius: '7px',
        border: "1px solid rgb(209 217 193)",
    }

    if (emptys(props.title)) {
        style["height"] = '30px'
    }

    const title = <div
        style={style}
        onMouseOver={() => {
            if (disabled) {
                setDisabled(false);
            }
        }}
        onMouseOut={() => {
            setDisabled(true);
        }}
        // fix eslintjsx-a11y/mouse-events-have-key-events
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
        onFocus={() => { }}
        onBlur={() => { }}
    // end
    >
        {HTMLElem(props.title)}
    </div>


    useEffect(() => {
        log(`open=${props.open} send=${ref.current.send} title=${props.title}`)
        if (props.open && !emptys(props.title)) {
            BNotify(ref.current.send ? BreadCrumbAction.REPLACE : BreadCrumbAction.PUSH, props.title)
            ref.current.send = true;
        }
        if (!props.open) breadPop()
    }, [props.open, props.title]);

    const breadPop = () => {
        log(`POP open=${props.open} send=${ref.current.send} title=${props.title}`)
        if (ref.current.send) {
            BNotify(BreadCrumbAction.POP);
            ref.current.send = false
        }
    }

    const cbreadPop = (e: string | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        breadPop()
    }


    return <Modal destroyOnClose open={props.open} title={title} maskClosable={false}
        onCancel={(e) => { log("CANCEL"); cbreadPop(e); props.onClose(e) }} {...props.modalprops} footer={props.buttons}
        onOk={(e) => { log("CANCEL"); cbreadPop(e); if (props.onOk) props.onOk(e) }}
        modalRender={(modal) => (
            <Draggable
                disabled={disabled}
                bounds={bounds}
                onStart={(event, uiData) => onStart(event, uiData)}
            >
                <div ref={draggleRef}>{modal}</div>
            </Draggable>
        )} >

        {props.children}
    </Modal >
}


export default ModalDialog;