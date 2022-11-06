import React from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import { getRouterContent, getRouterContentDir } from "../../restjsonapi/ts/layoutcontent";
import Page404 from './404'
import { getMenuRoute } from "../ts/leftmenu";

const AppContent: React.FC = () =>
    <Routes>
        {getMenuRoute() ? <Route path="/" element={<Navigate replace to={getMenuRoute()?.rootredirect as string} />} /> : undefined}
        {getRouterContent()}
        {getRouterContentDir()}
        <Route path="*" element={<Page404 />} />
    </Routes>

export default AppContent;
