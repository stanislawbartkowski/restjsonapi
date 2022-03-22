import type { RestTableParam, ButtonElem } from '../../ts/typing';
import type { TagProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import type { ModalProps } from 'antd'

import type CSS from 'csstype'; 
import type { ReactNode } from 'react';
import type { FilterDropdownProps } from 'antd/lib/table/interface';

export enum Status {
  PENDING,
  READY,
  ERROR,
}

export type FieldValue = string | number | boolean | undefined;

export const TOOLADD = "ADD"


type JSSupportedType = {
  js?: string
}

export type ClickResult = RestTableParam

export type ClickAction = ClickResult & {
  jsclick?: string
}

export type TableToolBarElem =  ButtonElem & TAction

export type TableToolBar = TableToolBarElem[]

export type TAction = JSSupportedType & ClickAction & FormMessage

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

export const TYPENUMBER = 'number'
export const TYPESTRING = 'string'
export const TYPEDATE = 'date'
export const TYPEBOOLEAN = 'boolean'


export type TColumn = {
  field: string;
  fieldtype?: string;
  coltitle?: string;
  props?: ColumnType<any>;
  showdetails?: ShowDetails | boolean;
  ident?: string
  addstyle?: AddStyle
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

export const emptyColumnList: ColumnList = { columns: [], rowkey: "" };

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

export type FilterElem = {
  field: string;
  value: FieldValue
  uppercase: string

}

export type SortFilter = {
  filter?: FilterElem[];
  sortinc?: string;
  sortdec?: string;
}

export type JsonTableResult = {
  res: RowData;
}

export const emptyModalListProps: ModalListProps = { visible: false, list: '' };

export type ModalListProps = RestTableParam & {
  visible: boolean
  closehook?: (e: React.MouseEvent<HTMLElement>) => void,
  props?: ModalProps
}

export type ColumnFilterSearch = {
  filterDropdown: (props: FilterDropdownProps) => ReactNode
  filterIcon: (filtered: boolean) => ReactNode
  onFilter: (value: string|number|boolean, record: TRow) => boolean;
  onFilterDropdownVisibleChange?: (visible: boolean) => void
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean
}

export type TField = {
  field: string;
  fieldtype?: string;
  coltitle?: string;
}

export type TForm = JSSupportedType & {
  fields: TField[]
}
