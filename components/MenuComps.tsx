import { getCookie, setCookie } from "../ts/cookies";
import { internalerrorlog, log } from "../ts/l";
import { FIsSelected, MenuElem, OnRowClick, RestTableParam, TComponentProps, TRow } from "../ts/typing";
import { history } from "../ts/CustomRouter";
import RestComponent from "./RestComponent";
import { useEffect, useState } from "react";
import readlist,{ DataSourceState } from "./ts/readlist";
import { useParams } from "react-router-dom";
import { ColumnList, Status, TColumn } from "./ts/typing";
import readdefs, { ReadDefsResult } from "./ts/readdefs";
import ReadListError from "./errors/ReadListError";
import { findColDetails } from "./ts/helper";

let resttableProps: RestTableParam = {}

// last menu name
let lastmenu: MenuElem | undefined = undefined
let coldetails : TColumn | undefined = undefined

export function getLastMenuName() : string | undefined {
    if (lastmenu === undefined || coldetails === undefined) return undefined
    const r : TRow = (lastmenu as any) as TRow
    return r[coldetails.field] as string | undefined
}
// -------------------

export function setRestTableProps(p: RestTableParam) {
    resttableProps = p
}


export const MenuDirComponent: React.FC<TComponentProps & { pathid: string }> = (props) => {


    function cName(): string {
        return `${props.list as string}-menudir`
    }

    const fIs: FIsSelected = (t: TRow): boolean => {
        const id: string | undefined = getCookie(cName())
        if (id === undefined) return false;
        return id === t["id"]
    }

    const onRowC: OnRowClick = (t: TRow) => {
        const rid: string | undefined = t["id"] as string | undefined
        if (rid === undefined) {
            log("Attribute id is not defined, cannot set cookies");
            return
        }
        log(rid)
        setCookie(cName(), rid)
        history.push(`${props.pathid}/${rid}`)
        //        navigate(rid)
    }
    return <RestComponent {...props} isSelected={fIs} onRowClick={onRowC} />
}


export function createRestParam(p: MenuElem): TComponentProps {
    const pr: TComponentProps = { ...p, ...resttableProps }
    if (p.list === undefined && p.listdef === undefined) pr.list = p.id
    return pr;
}


export const MenuDirElemComponent: React.FC<MenuElem> = (props) => {

    const pr: TComponentProps = { ...createRestParam(props) }

    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        res: [],
    });

    const { id } = useParams();
    console.log(id)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        function setS(d: ReadDefsResult) {

            if (d.status === Status.READY) {

                const c: ColumnList = d.res as ColumnList
                coldetails = findColDetails(c)


                readlist({...pr, ...c}, (s: DataSourceState) => { setDataSource({ ...s }) })
                
            }
            else setDataSource({...d, res: []})

        }

        readdefs(props, setS)

    }, [props.id]);

    if (datasource.status === Status.PENDING) return null
    if (datasource.status === Status.ERROR) return <ReadListError />

    const lmenu : MenuElem[] = (datasource.res as any) as MenuElem[]
    lastmenu = lmenu.find(e => e.id === id)

    if (lastmenu === undefined) {
        internalerrorlog(`Cannot find ${id} in ${pr.list} ${pr.listdef}`)
        return <ReadListError />
    }

    const restpr: TComponentProps = { ...createRestParam({...lastmenu}) }

    return <RestComponent {...restpr} ispage />
}
