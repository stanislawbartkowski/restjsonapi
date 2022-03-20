import type { ReactNode } from "react";

import type { TExtendable, Row, ColumnList, ClickResult, TAction } from "./types";
import { clickAction } from './helper'
import RestTableList from '../RestTable'

function getExtendableProps(cols: ColumnList): TExtendable {

  function expand(r: Row): ReactNode {
    const res: ClickResult = clickAction(cols.extendable as TAction, r);
    return <RestTableList {...res} vars={r} />
    //    return <p style={{ margin: 0 }}>Hello</p>
  }

  return {
    expandedRowRender: expand,
  }
}

export default getExtendableProps
