import { Menu, Popover } from "antd";
import React, { ReactElement } from "react";
import { Image } from 'antd';

import provideMenu, { getDefaultMenu } from '../ts/layoutmenu'
import { getAppData } from '../ts/readresource'
import { useLocation } from 'react-router-dom'
import lstring from "../ts/localize";
import defaults from "../ts/defaults";

const Logo: React.FC = () => {


  const text = <span>{lstring('version')}</span>;
  const content = (
    <div>
      {defaults.verstring}
    </div>
  );

  const logo: string | undefined = getAppData() ? getAppData()['logo'] ? getAppData()['logo'] : undefined : undefined

  const image: ReactElement = logo ? (<Image style={{ paddingLeft: '20px' }} src={logo} width="60%" height='32px' />) : <div></div>;

  return  <Popover placement="left" title={text} content={content} trigger="click">{image} </Popover>

}

const LeftMenu: React.FC = () => {

  const logo: string | undefined = getAppData() ? getAppData()['logo'] ? getAppData()['logo'] : undefined : undefined

  const image: ReactElement | undefined = logo ? (<Image style={{ paddingLeft: '20px' }} src={logo} width="60%" height='32px' />) : undefined;

  const location = useLocation();
  //console.log(location.pathname);

  return (
    <React.Fragment>
      <div className="logo">
        <Logo />
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={getDefaultMenu(location.pathname)}>
        {provideMenu()}
      </Menu>
    </React.Fragment>
  );
};

export default LeftMenu;