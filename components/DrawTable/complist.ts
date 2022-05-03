import React from "react";
import { ModalDialogProps } from "../ts/typing";

const list: Map<string, React.FC<ModalDialogProps>> = new Map()

export function addComponent(name: string, component: React.FC<ModalDialogProps>) {
    list.set(name, component);
}

export function getComponent(name: string): React.FC<ModalDialogProps> {
    return list.get(name) as React.FC<ModalDialogProps>
}