import { RcFile } from "antd/lib/upload"
import { ReactNode } from "react"
import { UploadProps, UploadFile, message, Upload } from "antd"

import { getHost } from "../../../services/api"
import { getSessionId } from "../../../ts/j"
import lstring from "../../../ts/localize"
import { constructButtonElem } from "../../ts/constructbutton"
import { ButtonAction, UploadType } from "../../ts/typing"
import { IFieldContext, FField } from "./types"

// ================
// upload button
// ================


function getUpPars(file: RcFile): string {
    const fname = file.name
    const host = getHost()
    const uuid = getSessionId()
    return `${host}/upload?filename=${uuid}/${fname}`
}

const customRequest = (options: any) => {
    fetch(options.action, {
        method: 'POST',
        body: options.file
    }
    )
        .then(result => {
            console.log('Success:', result);
            options.onSuccess()
        })
        .catch(error => {
            console.error('Error:', error);
            options.onError()
        });

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

    const bu = constructButtonElem(upload, (b: ButtonAction) => { })

    return <Upload {...props}>
        {bu}
    </Upload>

}
