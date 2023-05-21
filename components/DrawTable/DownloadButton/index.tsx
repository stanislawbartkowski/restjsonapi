import { Button, Popconfirm, Tooltip } from "antd"
import getIcon from "../../../ts/icons"
import lstring from "../../../ts/localize"
import fileDownload from 'js-file-download';
import { restaction } from "../../../services/api";
import { HTTPMETHOD, RowData, TRow } from "../../../ts/typing";
import defaults from "../../../ts/defaults";
import { ColumnList } from "../../ts/typing";
import { ColumnsT } from "../typing";
import { generateExcelData } from "./helper";
import { removeHTMLtags } from "../../ts/helper";
import { useState } from "react";

interface DownloadButtonPars {
    cols: ColumnList,
    r_cols?: ColumnsT,
    rows: RowData,
    vars?: TRow,
    header?: string
}


const genDownloadFile = (header?: string): string => {
    //const h : string|undefined = header !== undefined ? removeHTMLtags(header) : undefined
    //return (h ?? defaults.downloadfile) + defaults.excelext
    return defaults.downloadfile + defaults.excelext
}

const DownloadButton: React.FC<DownloadButtonPars> = (props) => {

    const [loading, setLoading] = useState<boolean>(false);

    const icon = getIcon('fileexceloutlined')
    
    const click = () => {
        const jsdata = generateExcelData(props.cols, props.rows, props.r_cols, props.vars)
        setLoading(true)
        restaction(HTTPMETHOD.POST, defaults.downloadfileaction, undefined, jsdata, "arrayBuffer").then(({ data, response }) => {
            fileDownload(data as ArrayBuffer, genDownloadFile(props.header));
            setLoading(false)
        }
        ).finally( () => {
            setLoading(false)
        }
        )
    }


    return <Tooltip placement="bottom" title={lstring("buttondownloadtitle")}>
        <Popconfirm description={lstring("downloadexcelquestion")} title={lstring("listasexcelfile")} onConfirm={click}>
            <Button icon={icon} size="small" type="text" loading={loading}/>
        </Popconfirm>
    </Tooltip>
}

export default DownloadButton

