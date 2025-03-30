import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/UserInformation.css';
import logo from '../assets/images/logo.png';

const UserInformation = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [userImage, setUserImage] = useState(null); // No default image, will use icon instead
    const fileInputRef = useRef(null);
    
    const [userData, setUserData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '********',
        confirmPassword: '********'
    });

    const handleImageClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUserImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        // If we were editing and now we're not, we would normally save changes to the backend here
        if (isEditing) {
            // Save logic would go here
            console.log('Saving user data:', userData);
        }
    };

    return (
        <div className="user-information-page">
            {/* Header styled like Home.js */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/basketball" className="nav-link">Basketball</Link>
                    <Link to="/casual" className="nav-link">Casual</Link>
                    <Link to="/running" className="nav-link">Running</Link>
                </nav>
                <div className="auth-buttons">
                    <Link to="/profile" className="auth-button active">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        My Profile
                    </Link>
                </div>
            </header>

            <main className="user-content">
                <div className="profile-container">
                    <div className="user-avatar-container">
                        <div 
                            className={`user-avatar ${isEditing ? 'editable' : ''}`} 
                            onClick={handleImageClick}
                            style={userImage ? { backgroundImage: `url(${userImage})` } : {}}
                        >
                            {/* Show icon if no user image */}
                            {!userImage && <i className="fas fa-user default-avatar-icon"></i>}
                            
                            {isEditing && (
                                <div className="upload-overlay">
                                    <i className="fas fa-camera"></i>
                                    <p>Upload Photo</p>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                        />
                    </div>

                    <div className="profile-form">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input 
                                type="text" 
                                id="firstName" 
                                name="firstName" 
                                value={userData.firstName}
                                onChange={handleInputChange}
                                disabled={!isEditing} 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input 
                                type="text" 
                                id="lastName" 
                                name="lastName" 
                                value={userData.lastName}
                                onChange={handleInputChange}
                                disabled={!isEditing} 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={userData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing} 
                            />
                        </div>
                        {isEditing && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        name="password" 
                                        value={userData.password}
                                        onChange={handleInputChange}
                                        disabled={!isEditing} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        value={userData.confirmPassword}
                                        onChange={handleInputChange}
                                        disabled={!isEditing} 
                                    />
                                </div>
                            </>
                        )}

                        <button 
                            className={`edit-button ${isEditing ? 'save-button' : ''}`}
                            onClick={toggleEdit}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default UserInformation;