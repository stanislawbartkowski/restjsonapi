import { Button, Popconfirm, Tooltip } from "antd"


import lstring from "../../ts/localize";
import getIcon from "../../ts/icons";
import { log } from "../../ts/l";
import { FRereadRest } from "../ts/typing";

interface RefreshButtonPars {
    refresh: FRereadRest
}


const RefreshButton: React.FC<RefreshButtonPars> = (props) => {

    const icon = getIcon('reloadoutlined')

    const click = () => {
        props.refresh()
    }


    return <Tooltip placement="bottom" title={lstring("refreshbuttontitle")}>
        <Popconfirm description={lstring("refreshtablequestion")} title={lstring("empty")} onConfirm={click}>
            <Button icon={icon} size="small" type="text" />
        </Popconfirm>
    </Tooltip>
}

export default RefreshButton