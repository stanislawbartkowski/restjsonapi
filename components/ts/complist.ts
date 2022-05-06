import React from "react";
import { TComponentProps } from "../../ts/typing";

const list: Map<string, React.FC<TComponentProps>> = new Map()

export function addComponent(name: string, component: React.FC<TComponentProps>) {
    list.set(name, component);
}

export function getComponent(name: string): React.FC<TComponentProps> {
    return list.get(name) as React.FC<TComponentProps>
}