import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Chat from '../public/Component/Chat';

import '../public/styles/chat.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Chat/>}/>
                </Routes>
            </div>
        </Router>
    );
};

export default App;



