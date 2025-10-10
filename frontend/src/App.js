import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';

import Authentication from './pages/Authentication.jsx';
import { AuthProvider } from './contexts/AuthContexts.jsx';
import VideoMeet from './components/videomeet/VideoMeet';
import HomeComponent from './pages/home.jsx';
import History from './pages/history.jsx';
import Groups from './pages/Groups.jsx';

function App() {
  return (
    <div className='App'>
    <Router>
      <AuthProvider>
      <Routes>
        <Route path='/' element={<LandingPage/>}></Route>
        <Route path='/auth' element={<Authentication></Authentication>}/>
        <Route path='/home' element={<HomeComponent/>} />
        <Route path='/history' element={<History></History>}/>
        <Route path='/group' element={<Groups />}/>
        <Route path='/:url' element={<VideoMeet/>}/>
      </Routes>
      </AuthProvider>
    </Router>
    </div>
  );
}

export default App;
