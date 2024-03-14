import React from 'react';

import { Typography } from 'antd';


const { Text } = Typography;

type HeaderInfo = {
    info: string | undefined
}


const InfoHeader: React.FC<HeaderInfo> = (props) => {

    return props.info === undefined ? <span/> : <Text className="header-info" strong >{props.info}</Text>

};

export default InfoHeader;