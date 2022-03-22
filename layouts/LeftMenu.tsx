import { Menu } from "antd";
import React from "react";

import provideMenu,{getDefaultMenu} from '../ts/layoutmenu'

const LeftMenu: React.FC = () => {

  return (
    <React.Fragment>
      <div className="logo" />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={getDefaultMenu()}>
        {provideMenu()}
      </Menu>
    </React.Fragment>
  );
};

export default LeftMenu;