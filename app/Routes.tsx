/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import Menu from './components/Menu';

// Lazily load routes and code split with webpack
// const LazyCounterPage = React.lazy(() =>
//   import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
// );
const LazySyncPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/SyncPage')
);

// const CounterPage = (props: Record<string, any>) => (
//   <React.Suspense fallback={<h1>Loading...</h1>}>
//     <LazyCounterPage {...props} />
//   </React.Suspense>
// );

const SyncPage = (props: Record<string, unknown>) => (
  <React.Suspense fallback={<Menu />}>
    <LazySyncPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.SYNC} component={SyncPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
