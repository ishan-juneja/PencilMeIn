#download the following dependencies: flask, authlib.integrations.flask_client, google-api-python-client, google-auth-httplib2, google-auth-oauthlib
#we will be requesting from the browser: http://localhost:5000 (this is the authorized javascript origin)




import os
import flask
import requests
import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery
import app
from dotenv import load_dotenv

load_dotenv()

var_name = os.getenv('SECRET_KEY')
CLIENT_SECRETS_FILE = '.credentials.json'

SCOPES = ['https://www.googleapis.com/auth/calendar'] #this scope will allow PMI to read the user's calendar events as well as put in new event
API_SERVICE_NAME = 'calendar'
API_VERSION = 'v3'
    

app = flask.Flask(__name__) 
app.secret_key = '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' #TODO: once app is in production, keep the secret key in a separate file

@app.route('/')
def index():
    return print_index_table()

#login for google
@app.route('/login/google')
def google_login():
    try: #try to login
        redirect_uri = flask.url_for('authorize', _external=True) #external window to popup login for google
        return google.authorize_redirect(redirect_uri)
    except Exception as e: #if error occurs
        app.logger.error(f"Error during login:{str(e)}")
        return "Error occred during login", 500 #internal server error

@app.route('/calendar')
def calendar_api_request():
    if 'credentials' not in flask.session:
        return flask.redirect('authorize')
    
    features = flask.session['features']
    
    # we will see if the credentials are valid for this user to test the google calendar api
    if features['calendar']:
        return ('<p>User granted the Google Calendar read permission. '+
                'This sample code does not include code to call Calendar</p>')
    else:
        return ('<p>User did not grant the Google Calendar read permission</p>')

  
#authorize for google
@app.route('/authorize')
def google_authorize():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
    #the URI created here will match the authorized redirect URI from the OAuth 2.0 client configuration in the Google Cloud Console
    flow.redirect_uri = flask.url_for('oauth2callback', _external=True)

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )

    flask.session['state'] = state
    return flask.redirect(authorization_url)

#callback for google, this is where the user will be redirected to after they have logged in
@app.route('/oauth2callback')
def oauth2callback():
    state = flask.session['state']

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    flow.redirect_uri = flask.url_for('oauth2callback', _external=True)

    authorization_response = flask.request.url
    flow.fetch_token(authorization_response=authorization_response)

    #the flask.session is a temporary fix for the credentials. We will need to save the credentials in firebase
    #TODO: Later on, we need to save these credentials in firebase once we set up our database
    credentials = flow.credentials
    credentials = credentials_to_dict(credentials)
    flask.session['credentials'] = credentials

    features = check_granted_scopes(credentials)
    flask.session['features'] = features
    return flask.redirect('/')

#this is if you aren't added to the oauth consent screen. Every developer should be added, but text the gc if you aren't
@app.route('/revoke')
def revoke():
    if 'credentials' not in flask.session:
        return ('You need to <a href="/authorize">authorize</a> before ' +
                'testing the code to revoke credentials.')

    credentials = google.oauth2.credentials.Credentials(
        **flask.session['credentials'])

    revoke = requests.post('https://oauth2.googleapis.com/revoke',
        params={'token': credentials.token},
        headers = {'content-type': 'application/x-www-form-urlencoded'})

    status_code = getattr(revoke, 'status_code')
    if status_code == 200:
        return('Credentials successfully revoked.' + print_index_table())
    else:
        return('An error occurred.' + print_index_table())

@app.route('/clear')
def clear_credentials():
    if 'credentials' in flask.session:
        del flask.session['credentials']
    return ('Credentials have been cleared.<br><br>' +
            print_index_table())


def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'granted_scopes': credentials.granted_scopes
    }


def check_granted_scopes(credentials):
    features = {}
    if 'https://www.googleapis.com/auth/drive.metadata.readonly' in credentials['granted_scopes']:
        features['drive'] = True
    else:
        features['drive'] = False

    if 'https://www.googleapis.com/auth/calendar' in credentials['granted_scopes']:
        features['calendar'] = True
    else:
        features['calendar'] = False

    return features

#This is the barebones ui to check if the google calendar api is working
def print_index_table():
    return ('<table>' +
            '<tr><td><a href="/test">Test an API request</a></td>' +
            '<td>Submit an API request and see a formatted JSON response. ' +
            '    Go through the authorization flow if there are no stored ' +
            '    credentials for the user.</td></tr>' +
            '<tr><td><a href="/authorize">Test the auth flow directly</a></td>' +
            '<td>Go directly to the authorization flow. If there are stored ' +
            '    credentials, you still might not be prompted to reauthorize ' +
            '    the application.</td></tr>' +
            '<tr><td><a href="/revoke">Revoke current credentials</a></td>' +
            '<td>Revoke the access token associated with the current user ' +
            '    session. After revoking credentials, if you go to the test ' +
            '    page, you should see an <code>invalid_grant</code> error.' +
            '</td></tr>' +
            '<tr><td><a href="/clear">Clear Flask session credentials</a></td>' +
            '<td>Clear the access token currently stored in the user session. ' +
            '    After clearing the token, if you <a href="/test">test the ' +
            '    API request</a> again, you should go back to the auth flow.' +
            '</td></tr></table>')

if __name__ == '__main__':
  # When running locally, disable OAuthlib's HTTPs verification.
  #NOTE: When running in production *do not* leave this option enabled.
  os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

  # This disables the requested scopes and granted scopes check.
  # If users only grant partial request, the warning would not be thrown.
  os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

  # Specify a hostname and port that are set as a valid redirect URI
  # for your API project in the Google API Console.
  app.run(host='0.0.0.0', port=5000, debug=True)