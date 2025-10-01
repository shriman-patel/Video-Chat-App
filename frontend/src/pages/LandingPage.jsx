import React from 'react'
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
export default function LandingPage() {
 const router = useNavigate();
 
  return (
    <div className='landingPageContainer'>
    <nav>
        <div className='navHeader'><h2>Apna Video Call</h2></div>
        <div className='navlist'>
            <p onClick={() =>{
              router("/gdst")
            }}>Join as Gest</p>
            <p onClick={()=>{
              router("/auth")}}>Register</p>
            <div onClick={()=>{
              router("/auth")}} role='button'>
                <p>Login</p></div>
        </div>
    </nav>

    <div className='landingMainContainer'>
        <div>
            <h1><span style={{color:"#FF9"}}>Connect</span> with you</h1>
      <p>Cover a distance By Apna Video Call</p>
      <div role='button'>
        <Link to={"/home"}>Get Started</Link>
      </div>
        </div>
        <div>
            <img src='/mobile.png' alt=''></img>
        </div>

    </div>
    </div>
  )
}


