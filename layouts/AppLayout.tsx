import React, { useEffect } from "react";
import { useState } from "react";
import "./style.css";
import { Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import AppContent from "./AppContent";
import LeftMenu from "./LeftMenu";
import HeaderLine from './HeaderLine'
import { getAppData, getAppJSS } from "../ts/readresource";

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  // This effect runs once, after the first render
  useEffect(() => {
    document.title = getAppData()['title']
  }, [])

  // define global jscript code
  getAppJSS().forEach ( j =>{
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
        style={{
          minHeight: "100vh",
        }}
      >
        <LeftMenu collapsed={collapsed} />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            }
          )}
          <HeaderLine />
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "24px 16px",
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
