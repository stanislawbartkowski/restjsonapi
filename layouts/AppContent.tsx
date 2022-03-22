import React from "react";

import { Routes } from "react-router-dom";

import getRouterContent from "../../restjsonapi/ts/layoutcontent";

const AppContent: React.FC = () => <Routes>{getRouterContent()}</Routes>;

export default AppContent;
