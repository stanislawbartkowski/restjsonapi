import type { FormProps, TagProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import type { ModalProps } from 'antd'
import type CSS from 'csstype';
import type { ReactNode } from 'react';
import { FormItemProps } from 'antd';
import type { FilterDropdownProps } from 'antd/lib/table/interface';

import type { RestTableParam, ButtonElem, FIELDTYPE } from '../../ts/typing';

export enum NotificationKind {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
  WARN = 'warn',
}

export type TNotification = {
  kind?: NotificationKind,
  title: FormMessage,
  description: FormMessage
}

export enum Status {
  PENDING,
  READY,
  ERROR,
}

export type FieldValue = string | number | boolean | undefined;

export enum BUTTONACTION {
  ADD = "ADD",
  ACCEPT = "ACCEPT",
  CANCEL = 'CANCEL',
  DEL = 'DEL',
  UPDATE = 'UPDATE'
}

type JSSupportedType = {
  js?: string
}

export type FieldError = {
  field: string
  err: FormMessage
}

export type ActionResult = {
  error?: FieldError[]
  notification?: TNotification
}

export type ClickResult = RestTableParam & ActionResult & {
  close?: boolean,
  upload?: boolean
}

export type ClickAction = ClickResult & {
  jsclick?: string
}

export type TAction = ClickAction & FormMessage

export type ButtonAction = ButtonElem & TAction & {
  validate?: boolean
  confirm?: FormMessage | boolean
}

export type TableToolBar = ButtonAction[]


export type FormMessage = JSSupportedType & {
  messagedirect?: string
  message?: string
  params?: string[]
}

export type ShowDetails = {
  title: FormMessage
}

export type AddStyle = JSSupportedType & {
  style?: CSS.Properties
}

export type ColumnValue = JSSupportedType & FormMessage & {
  value?: FieldValue
}

export type TTag = {
  value: ColumnValue;
  props?: TagProps
}

export type TTags = JSSupportedType & TTag[]

export type TActions = JSSupportedType & TAction[]

export type TFieldBase = {
  field: string;
  fieldtype?: FIELDTYPE,
  coltitle?: string;
  addstyle?: AddStyle
}

export type TColumn = TFieldBase & {
  props?: ColumnType<any>;
  showdetails?: ShowDetails | boolean;
  ident?: string
  value?: ColumnValue
  tags?: TTags
  actions?: TActions
  nofilter?: boolean
  nosort?: boolean
};

export type ColumnList = JSSupportedType & {
  rowkey: string;
  header?: FormMessage;
  columns: TColumn[];
  extendable?: TAction;
  toolbar?: TableToolBar;
};

export type TRow = any;

export type RowData = TRow[];

export type FShowDetails = (entity: TRow) => void
export type FActionResult = (entity: TRow, r: ClickResult) => void

export type TableHookParam = {
  fdetails: FShowDetails;
  fresult: FActionResult;
}

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export type JsonTableResult = {
  res: RowData;
}

export const emptyModalListProps: ModalListProps = { visible: false, list: '' };

export type TCloseFunction = (closebutton?: ButtonAction, row?: TRow) => void

export type ModalListProps = RestTableParam & {
  visible: boolean
  closeModal?: TCloseFunction,
  props?: ModalProps
  formprops?: FormProps
}

export type ColumnFilterSearch = {
  filterDropdown: (props: FilterDropdownProps) => ReactNode
  filterIcon: (filtered: boolean) => ReactNode
  onFilter: (value: string | number | boolean, record: TRow) => boolean;
  onFilterDropdownVisibleChange?: (visible: boolean) => void
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean
}

export type TField = TFieldBase & {
  props?: FormItemProps
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

