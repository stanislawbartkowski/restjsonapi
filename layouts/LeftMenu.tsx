import { Menu, Popover } from "antd";
import React, { ReactElement } from "react";
import { Image } from 'antd';

import provideMenu, { getDefaultMenu } from '../ts/layoutmenu'
import { getAppData } from '../ts/readresource'
import { useLocation } from 'react-router-dom'
import lstring from "../ts/localize";
import defaults from "../ts/defaults";


type TLeftMenu = {
  collapsed: boolean
}

const Logo: React.FC<TLeftMenu> = (props) => {


  const text = <span>{lstring('version')}</span>;
  const content = (
    <div>
      {defaults.verstring}<br />
      {getAppData().version}
    </div>
  );

  const logkey = props.collapsed ? 'logosmall' : 'logo'

  const logo: string | undefined = getAppData() ? getAppData()[logkey] ? getAppData()[logkey] : undefined : undefined

  if (logo === undefined) return <span />

  const image: ReactElement = props.collapsed ? <Image style={{ paddingLeft: '1px' }} src={logo} width="100%" height='32px' /> :
    <Image style={{ paddingLeft: '20px' }} src={logo} width="60%" height='32px' />

  return <Popover placement="left" title={text} content={content} trigger="click">{image} </Popover>

}

const LeftMenu: React.FC<TLeftMenu> = (props) => {


  const location = useLocation();
  //console.log(location.pathname);

  return (
    <React.Fragment>
      <div className="logo">
        <Logo {...props} />
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={getDefaultMenu(location.pathname)}>
        {provideMenu()}
      </Menu>
    </React.Fragment>
  );
};

export default LeftMenu;