import React, { useState, useEffect } from "react";

import lstring from "../..//ts/localize";
import type { RestTableParam } from "../../ts/typing";
import type { ColumnList } from "./typing";
import { Status } from "./typing";
import InLine from "../../ts/inline";
import type { ReadDefsResult } from "./js/readdefs";
import readdefs from "./js/readdefs";
import RestTableView from "./RestTableView";
import Cards from './Cards'
import { isCard } from './js/helper'
import RestTableError from "./errors/ReadDefError";

const emptyColumnList: ColumnList = { rowkey: "" };

const RestTableCannotDisplay: React.FC<{ errmess: string }> = (props) => {
  return <div> {lstring(props.errmess)}</div>;
};

type ListState = {
  list: string;
  status: Status;
  cols: ColumnList;
  js?: string;
};

const RestTableList: React.FC<RestTableParam> = (props) => {
  const [state, setState] = useState<ListState>({
    status: Status.PENDING,
    cols: emptyColumnList,
    list: props.list as string,
  });

  const dispmess: string | undefined = props.canDisplay
    ? props.canDisplay(props)
    : undefined;

  if (dispmess) return <RestTableCannotDisplay errmess={dispmess} />;

  if (state.status === Status.READY && state.list !== props.list) {
    setState({
      status: Status.PENDING,
      cols: emptyColumnList,
      list: props.list as string,
    });
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {

    function setS(d: ReadDefsResult) {

      if (d.status === Status.READY)
        setState({
          status: Status.READY,
          cols: { ...(d.res as ColumnList) },
          js: d.js,
          list: props.list as string,
        })
      else setState({
        status: Status.ERROR,
        cols: emptyColumnList,
        list: props.list as string,
      })

    }

    readdefs(props, setS)

  }, [props.list, props.listdef]);

  switch (state.status) {
    case Status.PENDING: {
      return null;
    }

    case Status.ERROR: {
      return <RestTableError />;
    }

    default:
      if (state.status === Status.READY) {
        return (
          <React.Fragment>
            <InLine js={state.js} />
            {isCard(state.cols) ? <Cards {...state.cols} {...props}></Cards> : <RestTableView {...state.cols} {...props} />}
          </React.Fragment>
        );
      } else return null;
  }
};

export default RestTableList;
