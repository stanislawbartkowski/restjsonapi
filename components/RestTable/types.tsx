import type { RestTableParam } from '@/restjsonapi/ts/typing';
import type { TagProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import type { ModalProps } from 'antd'

import type CSS from 'csstype';

export enum Status {
  PENDING,
  READY,
  ERROR,
}


export type FieldValue = string | number | boolean | undefined;


type JSSupportedType = {
  js?: string
}

export type ClickResult = RestTableParam;

export type ClickAction = ClickResult & {
  jsclick?: string
}

export type TAction = JSSupportedType & FormMessage & ClickAction


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
export const TYPEBOOL = 'boolean'


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

};

export type ColumnList = JSSupportedType & {
  rowkey: string
  header?: FormMessage;
  columns: TColumn[];
};

export const emptyColumnList: ColumnList = { columns: [], rowkey: "" };

export type ListState = {
  status: Status;
  cols: ColumnList;
  js?: string;
};

export type Row = any;

export type RowData = Row[];

export type FShowDetails = (entity: Row) => void
export type FActionResult = (entity: Row, r: ClickResult) => void

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
  data: RowData;
}

export const emptyModalListProps: ModalListProps = { visible: false, list: '' };

export type ModalListProps = RestTableParam & {
  visible: boolean
  closehook?: () => void
  props?: ModalProps
}

