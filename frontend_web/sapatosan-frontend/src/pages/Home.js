import React from 'react';
import '../assets/css/Home.css'; // Import the CSS file for styling
import logo from '../assets/images/logo.png'; // Import the logo

const Home = () => {
    return (
        <div>
            <header className="header">
                <div className="logo-container">
                    <img src={logo} alt="Sapatosan Logo" className="logo" />
                </div>
                <nav className="nav-links">
                    <a href="#home" className="nav-link">Home</a>
                    <a href="#basketball" className="nav-link">Basketball</a>
                    <a href="#casual" className="nav-link">Casual</a>
                    <a href="#running" className="nav-link">Running</a>
                </nav>
                <div className="auth-buttons">
                    <a href="#join" className="auth-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Join Us
                    </a>
                </div>
            </header>
            <main>
                <h1>Welcome to Sapatosan</h1>
                <p>This is the homepage of the Sapatosan website.</p>
            </main>
        </div>
    );
};

export default Home;