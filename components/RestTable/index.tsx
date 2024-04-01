import React, { useState, useEffect, ReactNode } from "react";

import InLine from "../../ts/inline";
import { ClickActionProps, FSetProps, FSetTitle, RestTableParam } from "../../ts/typing";
import Cards from "../Cards";
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import RestTableView, { TRefreshTable } from "../DrawTable";
import RestTableError from "../errors/ReadDefError";
import { isCard } from "../ts/helper";
import { ColumnList, FRereadRest, Status } from "../ts/typing";
import { VIEW, changeViewF, getViewCookie, produceChangeDisplay, saveViewCookie } from "./helper";

type ListState = ReadDefsResult & {
    list: string;
};

const RestTable: React.FC<RestTableParam & ClickActionProps & { refreshno?: number, refreshD?: TRefreshTable, setTitle?: FSetTitle, expanded?: boolean, rereadRest?: FRereadRest, setModalProps?: FSetProps }> = (props) => {
    const [state, setState] = useState<ListState>({
        status: Status.PENDING,
        list: props.list as string,
    });

    const [statecard, setStateCard] = useState<ListState>({
        status: Status.PENDING,
        list: props.listcarddef as string,
    });

    const [currentview, setCurrentView] = useState<VIEW>(getViewCookie(props, props.listcarddef !== undefined ? VIEW.CARD : VIEW.LIST))

    // 2023/11/05 - removed, what it is about?
    //    if (state.status === Status.READY && state.list !== props.list) {
    //        setState({
    //            status: Status.PENDING,
    //            list: props.list as string,
    //        });
    //        return null;
    //    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        function setS(d: ReadDefsResult) {

            // 2023/11/05 - removed, what it is about?
            //            if (d.status === Status.READY)
            //                setState({
            //                    ...d,
            //                    list: props.list as string,
            //                })
            //            else setState({
            //                ...d,
            //                list: props.list as string,
            //            })

            if (props.setModalProps !== undefined && d.res?.modalprops !== undefined)
                props.setModalProps(d.res.modalprops)
            setState({
                ...d,
                list: props.list as string,
            })


        }

        readdefs(props, setS)

    }, [props.list, props.listdef]);

    useEffect(() => {

        function setS(d: ReadDefsResult) {

            setStateCard({
                ...d,
                list: props.list as string,
            })

        }

        if (props.listcarddef === undefined) {
            setStateCard({ status: Status.READY, list: "" })
        }
        else {
            const cardprops = { ...props, listdef: props.listcarddef }
            readdefs(cardprops, setS)
        }

    }, [props.listcarddef]);

    function calcStatus(): Status {
        if (state.status == Status.ERROR || statecard.status == Status.ERROR) return Status.ERROR
        if (state.status == Status.PENDING || statecard.status == Status.PENDING) return Status.PENDING
        return Status.READY
    }

    const onChangeView: changeViewF = (view: VIEW) => {
        if (currentview === view) return
        setCurrentView(view)
        saveViewCookie(props, view)
    }

    const switchView: ReactNode | undefined = props.listcarddef === undefined ? undefined : produceChangeDisplay(onChangeView, currentview)

    switch (calcStatus()) {
        case Status.PENDING: {
            return null;
        }

        case Status.ERROR: {
            return <RestTableError />;
        }

        default:
            if (state.status === Status.READY) {
                const currentprops = currentview === VIEW.LIST ? { ...props } : { ...props, listdef: props.listcarddef }
                const currentstate: ListState = currentview === VIEW.LIST ? state : statecard
                return (
                    <React.Fragment>
                        <InLine js={state.js} />
                        {isCard(currentstate.res as ColumnList) && (currentstate.res as ColumnList).onerow === undefined ?
                            <Cards {...(currentstate.res as ColumnList)} {...currentprops} refreshno={props.refreshno} switchDisplay={switchView}></Cards> :
                            <RestTableView {...(currentstate.res as ColumnList)} {...currentprops} refreshno={props.refreshno} refreshD={props.refreshD} setTitle={props.setTitle} rereadRest={props.rereadRest} switchDisplay={switchView} />}
                    </React.Fragment>
                );
            } else return null;
    }
};

export default RestTable;
