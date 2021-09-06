import { css, cx } from '@emotion/css';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { Redirect, Route, Switch, useLocation } from 'wouter';
import './App.css';
import { environment } from './Environment';

import { Demo as Demo1 } from './demo1/Demo';
import { Demo as Demo2 } from './demo2/Demo';
import { Demo as Demo3 } from './demo3/Demo';
import { Demo as Demo4 } from './demo4/Demo';
import { Demo as Demo5 } from './demo5/Demo';

function App() {

    const [location, setLocation] = useLocation();

    return (
        <RelayEnvironmentProvider environment={environment}>
            <Suspense fallback="Loading...">
                <div className={css({
                    display: "flex",
                    "&>div.left": {
                        width: "280px",
                        "&>div": {
                            borderBottom: "solid 1px gray",
                            padding: "1rem"
                        }
                    },
                    "&>div.right": {
                        padding: "1rem"
                    }
                })}>
                    <div className="left">
                        <div><h1>Demo List</h1></div>
                        <div 
                        className={cx({[SELECTED_MENU]: location === "/useTypedPreloadedQuery"})}
                        onClick={() => setLocation("/useTypedPreloadedQuery")}>
                            useTypedPreloadedQuery
                        </div>
                        <div 
                        className={cx({[SELECTED_MENU]: location === "/useTypedLazyQuery"})}
                        onClick={() => setLocation("/useTypedLazyQuery")}>
                            useTypedLazyQuery
                        </div>
                        <div 
                        className={cx({[SELECTED_MENU]: location === "/useTypedFragment"})}
                        onClick={() => setLocation("/useTypedFragment")}>
                            useTypedFragment
                        </div>
                        <div 
                        className={cx({[SELECTED_MENU]: location === "/useTypedRefetchableFragment"})}
                        onClick={() => setLocation("/useTypedRefetchableFragment")}>
                            useTypedRefetchableFragment
                        </div>
                        <div 
                        className={cx({[SELECTED_MENU]: location === "/useTypedPaginationFragment"})}
                        onClick={() => setLocation("/useTypedPaginationFragment")}>
                            useTypedPaginationFragment
                        </div>
                    </div>
                    <div className="right">
                        <Switch>
                            <Route path="/useTypedPreloadedQuery" component={Demo1}/>
                            <Route path="/useTypedLazyQuery" component={Demo2}/>
                            <Route path="/useTypedFragment" component={Demo3}/>
                            <Route path="/useTypedRefetchableFragment" component={Demo4}/>
                            <Route path="/useTypedPaginationFragment" component={Demo5}/>
                            <Redirect to="/useTypedPreloadedQuery"/>
                        </Switch>
                    </div>
                </div>
            </Suspense>
        </RelayEnvironmentProvider>
    );
}

const SELECTED_MENU = css({
    backgroundColor: "darkblue",
    color: "white"
});

export default App;
