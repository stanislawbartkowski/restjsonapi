import React, { useState } from "react";
import { Button } from "antd";

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
        <Button icon={icon} size="small" onClick={() => setIsModalVisible(true)} />
        <DraggableModal open={isModalVisible} onClose={onCancel} buttons={null} title={lstring('changecolumnstitle')}>
            <SortColumns {...props} />
        </DraggableModal>

    </React.Fragment>

}

export default SearchButton;