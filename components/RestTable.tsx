import React, { useState, useEffect } from "react";

import InLine from "../ts/inline";
import { ClickActionProps, RestTableParam } from "../ts/typing";
import Cards from "./Cards";
import readdefs, { ReadDefsResult } from "./ts/readdefs";
import RestTableView, { TRefreshTable } from "./DrawTable";
import RestTableError from "./errors/ReadDefError";
import { isCard } from "./ts/helper";
import { ColumnList, Status } from "./ts/typing";

type ListState = ReadDefsResult & {
    list: string;
};

const RestTable: React.FC<RestTableParam & ClickActionProps & { refreshno?: number, refreshD?: TRefreshTable }> = (props) => {
    const [state, setState] = useState<ListState>({
        status: Status.PENDING,
        list: props.list as string,
    });


    if (state.status === Status.READY && state.list !== props.list) {
        setState({
            status: Status.PENDING,
            list: props.list as string,
        });
        return null;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        function setS(d: ReadDefsResult) {

            if (d.status === Status.READY)
                setState({
                    ...d,
                    list: props.list as string,
                })
            else setState({
                ...d,
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
                        {isCard(state.res as ColumnList) && (state.res as ColumnList).onerow === undefined ?
                            <Cards {...(state.res as ColumnList)} {...props} refreshno={props.refreshno}></Cards> :
                            <RestTableView {...(state.res as ColumnList)} {...props} refreshno={props.refreshno} refreshD={props.refreshD} />}
                    </React.Fragment>
                );
            } else return null;
    }
};

export default RestTable;
