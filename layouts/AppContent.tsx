import React from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import getRouterContent from "../../restjsonapi/ts/layoutcontent";
import Page404 from './404'
import { getMenuRoute } from "../ts/readresource";

const AppContent: React.FC = () =>
    <Routes>
        {getMenuRoute() ? <Route path="/" element={<Navigate replace to={getMenuRoute()?.rootredirect as string} />} /> : undefined}
        {getRouterContent()}
        <Route path="*" element={<Page404 />} />
    </Routes>;

export default AppContent;
