import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@google/model-viewer';
import ReduxToastr from 'react-redux-toastr';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './app.scss';
import Header from '../header/header';

const Home = lazy(() => import('../../sections/home/home'));
const dashboard = lazy(() => import(`../../sections/dashboard/${process.env.REACT_APP_DASHBOARD_TYPE}.js`));
const deviceMngt = lazy(() => import('../../sections/deviceMngt/deviceMngt.js'));
const userMngt = lazy(() => import('../../sections/userMngt/userMngt.js'));
const liveData = lazy(() => import(`../../sections/livedata/${process.env.REACT_APP_LIVEDATA_TYPE}.js`));
const daliyReport = lazy(() => import('../../sections/daliyReport/daliyReport.js'));
const alarmRule = lazy(() => import(`../../sections/alarm/alarmRule.js`));
const activeAlarm = lazy(() => import(`../../sections/alarm/activeAlarm.js`));
const apiKey = lazy(() => import(`../../sections/tpUser/tpUser.js`));
const diagnostics = lazy(() => import(`../../sections/diagnostics/diagnostics.js`));

class App extends React.Component {
    render() {
        return (
            <div>
            <Router data-test="mainAppTag">
                <Header />
                <Suspense fallback={<div>Loading...</div>}>
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route path="/dashboard" component={dashboard}/>
                        <Route path="/devices" component={deviceMngt}/>
                        <Route path="/users" component={userMngt}/>
                        <Route path="/livedata" component={liveData}/>
                        <Route path="/daliyReport" component={daliyReport}/>
                        <Route path="/alarmrule" component={alarmRule}/>
                        <Route path="/activealarm" component={activeAlarm}/>
                        <Route path="/apiKey" component={apiKey}/>
                        <Route path="/diagnostics" component={diagnostics}/>
                    </Switch>
                </Suspense>
            </Router>
            <ReduxToastr timeOut={6000} newestOnTop={false} position="top-right"
                getState={(state) => state.toastr} transitionIn="fadeIn" transitionOut="fadeOut"
                progressBar closeOnToastrClick
            />
            </div>
        );
    }
}

export default App;
