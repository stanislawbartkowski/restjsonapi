import React, { useEffect, useState } from "react";
import "./style.css";
import { Anchor, Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import AppContent from "./AppContent";
import LeftMenu from "./LeftMenu";
import HeaderLine from './HeaderLine'
import { getAppData, getAppJSS } from "../ts/readresource";
import AppBreadCrumb from "./AppBreadCrumb";

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  // This effect runs once, after the first render
  useEffect(() => {
    document.title = getAppData()['title']
  }, [])

  // define global jscript code
  getAppJSS().forEach(j => {
    const script = document.createElement('script');
    script.innerHTML = j;
    script.async = true;
    document.body.appendChild(script);
  })

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={"50px"}
        width={"205px"}
        style={{
          minHeight: "100vh",
        }}
      >
        <Anchor>
          <LeftMenu collapsed={collapsed} />
        </Anchor>
      </Sider>
      <Layout className="site-layout">
        <Anchor>
          <Header className="site-layout-background" style={{ padding: 0, height:95 }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed),
              }
            )}
            <HeaderLine />
            <AppBreadCrumb />
          </Header>
        </Anchor>
        <Content
          className="site-layout-background"
          style={{
            margin: "20px 10px",
            padding: 2,
          }}
        >
          <AppContent />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
