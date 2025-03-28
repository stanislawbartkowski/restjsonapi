import { RcFile } from "antd/lib/upload"
import { ReactNode } from "react"
import { UploadProps, UploadFile, message, Upload } from "antd"

import { customRequest, toEndPoint } from "../../../services/api"
import { getSessionId } from "../../../ts/j"
import lstring from "../../../ts/localize"
import { constructButtonElem } from "../../ts/constructbutton"
import { ButtonAction, UploadType } from "../../ts/typing"
import { IFieldContext, FField } from "./types"
import { OneRowData } from "../../../ts/typing"
import { getPars } from "./helper"

// ================
// upload button
// ================


function getUpPars(file: RcFile): string {
    const fname = file.name
    const uuid = getSessionId()
    const endpoint: string = `upload?filename=${uuid}/${fname}`
    return toEndPoint(endpoint, true)
}


export function produceUploadItem(ir: IFieldContext, t: FField): ReactNode {
    const upload: UploadType = t.upload as UploadType
    const props: UploadProps = {
        name: 'file',
        action: getUpPars,
        headers: {},
        customRequest: customRequest,
        onChange(info) {
            const f: UploadFile[] = info.fileList
            const ss: Map<string, UploadFile[]> = ir.upGet()
            ss.set(t.field, f);
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                const mess = lstring('fileuploadedsuccess', info.file.name);
                // message.success(`${info.file.name} file uploaded successfully`);
                message.success(mess);
            } else if (info.file.status === 'error') {
                const mess = lstring('fileuploadedfailure', info.file.name);
                //message.error(`${info.file.name} file upload failed.`);
                message.error(mess);
            }
            if (info.file.status === 'done' || info.file.status === 'removed') {
                ir.upSet(ss)
            }
        },
        ...upload.uploadprops
    };

    const pars: OneRowData = getPars(ir)

    const bu = constructButtonElem(upload, (b: ButtonAction) => { }, pars)

    return <Upload {...props}>
        {bu}
    </Upload>

}
