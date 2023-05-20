import React, { useState } from "react";
import { Button, Tooltip } from "antd";

import DraggableModal from "../../DraggableModal";
import getIcon from "../../../ts/icons";
import lstring from "../../../ts/localize";
import { SortProps } from "../typing";
import SortColumns from "./SortColumns";


const SearchButton: React.FC<SortProps> = (props) => {

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    function onCancel() {
        setIsModalVisible(false)
    }

    const icon = getIcon('formoutlined')


    return <React.Fragment>
        <Tooltip placement="bottom" title={lstring("reaarangecolumnstitle")}><Button icon={icon} size="small" onClick={() => setIsModalVisible(true)} type="text" /></Tooltip>
        <DraggableModal open={isModalVisible} onClose={onCancel} buttons={null} title={lstring('changecolumnstitle')}>
            <SortColumns {...props} />
        </DraggableModal>

    </React.Fragment>

}

export default SearchButton;