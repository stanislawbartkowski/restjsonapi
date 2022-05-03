import type { ReactNode } from 'react';

import type { TRow } from '../../ts/typing';

export enum BUTTONACTION {
  ADD = "ADD",
  ACCEPT = "ACCEPT",
  CANCEL = 'CANCEL',
  DEL = 'DEL',
  UPDATE = 'UPDATE',
  PRINT = 'PRINT'
}

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean
}

