import type { ReactNode } from 'react';

import type { PropsType, RestTableParam, TRow } from '../../ts/typing';
import { ButtonAction, JSSupportedType, TFieldBase } from '../ts/typing';

export enum BUTTONACTION {
  ADD = "ADD",
  ACCEPT = "ACCEPT",
  CANCEL = 'CANCEL',
  DEL = 'DEL',
  UPDATE = 'UPDATE'
}

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export const emptyModalListProps: ModalListProps = { visible: false, list: '' };

export type TCloseFunction = (closebutton?: ButtonAction, row?: TRow) => void

export type ModalListProps = RestTableParam & {
  visible: boolean
  closeModal?: TCloseFunction,
  props?: PropsType
  formprops?: PropsType
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean
}

export type TField = TFieldBase & {
  props?: PropsType
  iprops?: Record<string, any>
}

export type TForm = JSSupportedType & {
  fields: TField[]
  buttons: ButtonAction[]
}

export type FRefresh = () => void

export type ModalDialogProps = ModalListProps & {
  refresh: FRefresh
}

