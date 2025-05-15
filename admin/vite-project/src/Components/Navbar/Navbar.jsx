import React from "react";
import "./Navbar.css";
import navlogo from "../../assets/nav-logo.svg"
import navProfile from "../../assets/nav-profile.svg"

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={navlogo} alt="" />
      </div>
      <div className="nav-profile">
        <img src={navProfile} alt="" />
      </div>
    </div>
  );
};

export default Navbar;
