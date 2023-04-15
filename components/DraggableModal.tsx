import { Modal } from "antd";
import React, { CSSProperties, ReactNode, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { PropsType } from "../ts/typing";
import { emptys } from "./ts/helper";
import { HTMLElem } from "./ts/transcol";

type DraggablePros = {
    title?: string
    open: boolean
    onClose: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
    onOk?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
    modalprops?: PropsType
    buttons: ReactNode
    children: React.ReactNode
}

const ModalDialog: React.FC<DraggablePros> = (props) => {

    const draggleRef = useRef<HTMLDivElement>(null);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const [disabled, setDisabled] = useState(true);

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

    const style : CSSProperties = {
            width: 'calc(100% - 12px)',
            cursor: 'move',
            background: '#f3f4e2',
            padding: '5px',
            borderRadius: '7px',
            border: "1px solid rgb(209 217 193)" ,
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



    return <Modal destroyOnClose open={props.open} title={title}
        onCancel={props.onClose} {...props.modalprops} footer={props.buttons}
        onOk={(e) => {if (props.onOk) props.onOk(e) }}
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