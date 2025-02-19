
import './Popup.css'

function Popup(props) {
    return(props.trigger) ? (
        <div className = "popup">
            <div className="popup-inner">
                <h1 className="popup-header">Pencil Me In</h1>
                <p className="popup-text">How would you like to add your availability?</p>
                <div className="popup-button-container">
                    <button className="popup-button" id="google">Sign in with Google</button>
                    <button className="popup-button" id="apple">Sign in with Apple</button>
                    <button className="popup-button" id="manual" onClick = {() => props.setTrigger(false)}>Manually Input</button>
                </div>  
                { props.children }
            </div>
        </div>
    ) : "";
}

export default Popup