import './App.css';
import React from "react";
import VerifyAge from './Pages/VerifyAge';
import Verified from './Pages/Verified';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

function App() {


    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route exact path='/' component={VerifyAge}/>
                    <Route exact path='/verified' component={Verified}/>
                </Switch>
            </Router>
        </div>

    );
}

export default App;
