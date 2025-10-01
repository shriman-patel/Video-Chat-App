import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContexts';




function HomeComponent() {

    let navigate = useNavigate();
const [meetingCode, setMeetingCode]= useState("");

const {addToUserHistory} = useContext(AuthContext);
let handleJoinVideoCall = async() => {
   await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`)
}

  return (
  <>
  <div className="navBar">
    <div style={{ display:" flex", alignItems: "center" }}>
        <h1>Video Call</h1>
    </div>
    <div style={{display : 'flow', alignItems: "center"}}>
      <IconButton onClick={ () => {
        navigate("/history")
      }}>
        <RestoreIcon></RestoreIcon>
        <p>History</p>
      </IconButton>
      <Button onClick={ () => {
        localStorage.removeItem("token");
        navigate('/home');
      }}>
        Logout
      </Button>
    </div>
  </div>
<div className="meetContainer">
  <div className="leftPanel">
    <div>
    <h2>provaidin Quality video call just like Quality</h2>
    <div style={{display: 'flex', gap: "10px"}}>
        <TextField onChange={e => setMeetingCode(e.target.value)} id='outline' ></TextField>
        <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
    </div>
    </div>
  </div>
  <div className="rightPanel">
    <img srcSet='/logo.video.svg' alt=''></img>
  </div>
  </div>
  </>
  )
}

export default withAuth(HomeComponent);
