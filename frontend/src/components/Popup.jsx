import './Popup.css'
import { useState, useEffect } from 'react'

function Popup(props) {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // Replace with actual Google OAuth implementation
            // Redirect to a Google auth endpoint
            // OR use a library like react-google-login
            
            // Placeholder for the actual implementation
            window.location.href = '/api/auth/google'; 
            
            // 1. Redirect to Google auth
            // 2. Handle the callback with tokens
            // 3. Use the tokens to fetch calendar data
            // 4. Process and display availability
            
        } catch (error) {
            console.error("Google sign-in failed:", error);
            setIsLoading(false);
        }
    };
    
    const handleAppleSignIn = () => {
        // Placeholder for Apple sign-in implementation
        alert("Apple sign-in not implemented yet");
    };
    
    const handleManualInput = () => {
        props.setTrigger(false);
        // Add additional logic here to open a manual input form if needed
    };
    
    return(props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <h1 className="popup-header">Pencil Me In</h1>
                <p className="popup-text">How would you like to add your availability?</p>
                <div className="popup-button-container">
                    <button 
                        className="popup-button" 
                        id="google"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <img src="google-logo.png" alt="" className="google-icon" />
                        {isLoading ? "Connecting..." : "Sign in with Google"}
                    </button>
                    <button className="popup-button" id="apple" onClick={handleAppleSignIn}>
                        <img src="apple-logo.png" alt="" className="apple-icon" />
                        Sign in with Apple
                    </button>
                    <button 
                        className="popup-button" 
                        id="manual" 
                        onClick={handleManualInput}
                    >
                        Manually Input
                    </button>
                </div>  
                {props.children}
            </div>
        </div>
    ) : "";
}

export default Popup