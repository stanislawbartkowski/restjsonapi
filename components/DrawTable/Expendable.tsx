import type { ReactNode } from "react";

import type { ColumnList, ClickResult, TAction } from "../ts/typing";
import RestTableList from '../RestTable'
import type { TRow } from '../../ts/typing'
import { clickAction } from "../ts/helper";
import { commonVars } from "../../ts/j";
import defaults from "../../ts/defaults";
import { ExpandableConfig } from "antd/lib/table/interface";

function getExtendableProps(cols: ColumnList, vars?: TRow): ExpandableConfig<TRow> {


  function expand(r: TRow): ReactNode {
    const rr: TRow = { ...commonVars(), ...r }
    const res: ClickResult = clickAction(cols.extendable as TAction, { r: r, vars: vars });
    return <RestTableList  {...res} vars={rr} expanded rereadRest={() => {}} />
  }

  return {
    //fixed: true,
    expandedRowRender: expand,
    columnWidth: defaults.expandSize
  }
}

export default getExtendableProps
