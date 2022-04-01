import { Menu} from "antd";
import React, { ReactElement } from "react";
import { Image } from 'antd';

import provideMenu, { getDefaultMenu } from '../ts/layoutmenu'
import { getAppData } from '../ts/readresource'

const LeftMenu: React.FC = () => {

  const logo: string | undefined = getAppData() ? getAppData()['logo'] ? getAppData()['logo'] : undefined : undefined

  const image: ReactElement | undefined = logo ? (<Image style={{paddingLeft : '20px' }} src={logo} width="60%" height='32px'/>) : undefined;

return (
  <React.Fragment>
    <div className="logo">
      {image}
    </div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={getDefaultMenu()}>
      {provideMenu()}
    </Menu>
  </React.Fragment>
);
};

export default LeftMenu;