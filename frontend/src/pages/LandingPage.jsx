import React from 'react';
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className='landingPageContainer' style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1, // video background ke peeche
        }}
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Nav and main content */}
      <nav style={{ position: 'relative', zIndex: 1 }}>
        <div className='navHeader'><h2>Apna Video Call</h2></div>
        <div className='navlist'>
          <p onClick={() => router("/auth")}>Join as Guest</p>
          <p onClick={() => router("/auth")}>Register</p>
          <div onClick={() => router("/auth")} role='button'>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className='landingMainContainer' style={{ position: 'relative', zIndex: 1 }}>
        <div>
          <h1><span style={{color:"#FF9"}}>Connect</span> with you</h1>
          <p>Cover a distance By Apna Video Call</p>
          <div role='button'>
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
