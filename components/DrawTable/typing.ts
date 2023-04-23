import type { ReactNode } from 'react';

import type { TRow } from '../../ts/typing';

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean,
  fixed: boolean,
  columnWidth: number
}
