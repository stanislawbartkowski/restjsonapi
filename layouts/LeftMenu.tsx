import React, { ReactElement } from "react";
import { Menu, Popover } from "antd";
import { Image } from 'antd';

import provideMenu, { getDefaultMenu } from '../ts/layoutmenu'
import { getAppData } from '../ts/readresource'
import { useLocation } from 'react-router-dom'
import lstring from "../ts/localize";
import defaults from "../ts/defaults";
import { getDomain, isDomain } from "../ts/url";


type TLeftMenu = {
  collapsed: boolean
}

const Logo: React.FC<TLeftMenu> = (props) => {


  const domainname: string | undefined = getDomain()
  const domaininfo = isDomain() ? <div>{lstring('domaintitle')}:{domainname}</div> : undefined
  const text = <span>{lstring('version')}</span>;
  const content = (
    <div>
      {defaults.verstring}<br />
      {getAppData().version}<br />
      {domaininfo}
    </div>
  );

  const logkey = props.collapsed ? 'logosmall' : 'logo'

  const logo: string | undefined = getAppData() ? getAppData()[logkey] ? getAppData()[logkey] : undefined : undefined

  if (logo === undefined) return <span />

  const image: ReactElement = props.collapsed ? <Image preview={false} style={{ paddingLeft: '1px' }} src={logo} width="100%" height='32px' /> :
    <Image preview={false} style={{ paddingLeft: '20px' }} src={logo} width="60%" height='32px' />

  return <Popover placement="left" title={text} content={content} trigger="click">{image} </Popover>

}

const LeftMenu: React.FC<TLeftMenu> = (props) => {


  const location = useLocation();

  return <React.Fragment>
    <div className="logo">
      <Logo {...props} />
    </div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={getDefaultMenu(location.pathname)}>
      {provideMenu()}
    </Menu>
  </React.Fragment>;
};

export default LeftMenu;
