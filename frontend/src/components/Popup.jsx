import './Popup.css';
import { useState } from 'react';

function Popup(props) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Placeholder: redirect to your backend's Google OAuth endpoint
      window.location.href = '/api/auth/google';
      // After OAuth completes, your backend can redirect back with busy times
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    alert("Apple sign-in not implemented yet");
  };

  const handleManualInput = () => {
    props.setTrigger(false);
    // Could open a manual input form, or just close popup
  };

  return props.trigger ? (
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
  ) : null;
}

export default Popup;
