import { Button, Dropdown, MenuProps, Tooltip } from "antd"


import lstring from "../../ts/localize";
import { FSetSize } from "./typing";
import getIcon from "../../ts/icons";

type SizeMenuProps = {
    onSize: FSetSize
}

const SizeMenu: React.FC<SizeMenuProps> = (props) => {


    const items: MenuProps['items'] = [
        {
            key: 'large',
            label: lstring('largelabel'),
            onClick: () => props.onSize('large')
        },
        {
            key: 'middle',
            label: lstring('middlelabel'),
            onClick: () => props.onSize('middle')
        },
        {
            key: 'small',
            label: lstring('smalllabel'),
            onClick: () => props.onSize('small')
        },
    ]

    const icon = getIcon('fontsizeoutlined')
    return <Dropdown menu={{ items }} placement="bottomRight">
        <Tooltip placement="top" title={lstring("sizetabletitle")}><Button icon={icon} size="small" type="text" ></Button></Tooltip>
    </Dropdown>
}

export default SizeMenu