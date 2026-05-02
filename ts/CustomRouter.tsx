import React from "react";
import { Router } from "react-router";
import { createBrowserHistory, BrowserHistory, Action, Location } from "history";

import { log } from "./l";
import { pathNotify } from "./headernotifier";


const history = createBrowserHistory();

export function getBrowserHistory() {
  return history
}

export function pushBrowserPath(path: string) {
  history.push(path)
}

export function backBrowserPath() {
  history.back()
}

let previous = "";
let current = "";

export function getPrevious() {
  return previous;
}

let canD = (_action: Action, _path: string) => {
  return true;
};

export function setCanD(f: typeof canD) {
  canD = f;
}

interface CustomRouterProps {
  basename: string;
  children: React.ReactNode;
  history: BrowserHistory;
}

const CustomRouter = ({ basename, children, history }: CustomRouterProps) => {
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  if (state.location.pathname !== current) {
    previous = current;
    current = state.location.pathname;
  }

  function onChange({ action, location }: { action: Action; location: Location }) {
    const pathname = location.pathname;
    log(action + " : " + pathname);
    pathNotify(pathname)
    if (canD(action, pathname)) setState({ action, location });
  }

  React.useLayoutEffect(() => history.listen(onChange), [history]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
};

export default CustomRouter;
