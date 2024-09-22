import React from "react";
import { Router } from "react-router";
import { createBrowserHistory } from "history";

import { log } from "./l";
import { pathNotify } from "./headernotifier";


export const history = createBrowserHistory();

let previous = "";
let current = "";

export function getPrevious() {
  return previous;
}

let canD = () => {
  return true;
};

export function setCanD(f) {
  canD = f;
}

const CustomRouter = ({ basename, children, history }) => {
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  }); 
  
  if (state.location.pathname !== current) {
    previous = current;
    current = state.location.pathname;
  }

  function onChange(history) {
    const action = history.action;
    const pathname = history.location.pathname;
    log(action + " : " + pathname);
    pathNotify(pathname)
    if (canD(action, pathname)) setState(history);
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
