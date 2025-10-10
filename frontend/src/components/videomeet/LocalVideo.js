// src/components/videomeet/LocalVideo.js
import React from "react";
import styles from "../../styles/videoComponant.module.css"; // Import the styles

export default function LocalVideo({ localVideoref }) {
  return (
    <video
      className={styles.meetUserVideo}
      ref={localVideoref}
      autoPlay
      muted
    ></video>
  );
}