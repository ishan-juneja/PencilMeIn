#download the following dependencies: flask, authlib.integrations.flask_client, google-api-python-client, google-auth-httplib2, google-auth-oauthlib
#we will be requesting from the browser: http://localhost:5000 (this is the authorized javascript origin)
import os
import flask
from flask import jsonify, render_template
import google.oauth2.credentials
from google.oauth2.credentials import Credentials
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from datetime import datetime
import dateutil.parser
from dotenv import load_dotenv

load_dotenv()
CLIENT_SECRETS_FILE = '.credentials.json'
SCOPES = ['https://www.googleapis.com/auth/calendar'] #this scope will allow PMI to read the user's calendar events as well as put in new event
API_SERVICE_NAME = 'calendar'
API_VERSION = 'v3'

app = flask.Flask(__name__) 
app.secret_key = os.getenv("SECRET_KEY")


@app.route('/')
def index():
    return render_template('index.html')


#authorize for google
@app.route('/authorize')
def google_authorize():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
    #the URI created here will match the authorized redirect URI from the OAuth 2.0 client configuration in the Google Cloud Console
    flow.redirect_uri = flask.url_for('oauth2callback', _external=True)
    print("This is the uri " + flow.redirect_uri)
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )

    flask.session['state'] = state
    print ("This is the auth url " + authorization_url)
    return flask.redirect(authorization_url)

#callback for google, this is where the user will be redirected to after they have logged in
@app.route('/oauth2callback')
def oauth2callback():

    state = flask.session['state']

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    flow.redirect_uri = flask.url_for('oauth2callback', _external=True)

    authorization_response = flask.request.url #redirects to the authorization url

    try:
        flow.fetch_token(authorization_response=authorization_response)
    except Exception as e: #for test purposes
        print(f"Token Fetch Error: {e}") #if there is a http error thing, write the following terminal command:  export OAUTHLIB_INSECURE_TRANSPORT=1

    #the flask.session is a temporary fix for the credentials. We will need to save the credentials in firebase
    #TODO: Later on, we need to save these credentials in firebase once we set up our database
    print ("REACHED THIS STATEMENT")
    credentials = flow.credentials
    creds_dict = credentials_to_dict(credentials)

    creds = Credentials(
        token = creds_dict['token'],
        refresh_token = creds_dict['refresh_token'],
        token_uri = creds_dict['token_uri'],
        client_id = creds_dict['client_id'],
        client_secret = creds_dict['client_secret'],
        granted_scopes = creds_dict['granted_scopes']
    )


    service = build('calendar', 'v3', credentials = creds)
    
    #event = service.events().get(calendarId='primary', eventId='eventId').execute()
    events_result = service.events().list(calendarId='primary').execute() #this will scrape all of the calendar events from the user's primary calendar
    events = events_result.get('items', [])
    #for testing purposes:
    for event in events:
        print(event['id'], event.get('summary'))
    

    flask.session['credentials'] = creds_dict

    features = check_granted_scopes(creds_dict)
    flask.session['features'] = features
    return flask.redirect('/')

def credentials_to_dict(credentials):
    print("INSIDE GET CREDS")
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'granted_scopes': credentials.granted_scopes
    }


@app.route('/api/calendar')
def api_calendar():
    state = flask.session['state']
    credentials_dict = flask.session.get('credentials')
    if not credentials_dict:
        return jsonify({'error': 'User is not authenticated'}), 401
    
    creds = Credentials(
        token=credentials_dict['token'],
        refresh_token=credentials_dict['refresh_token'],
        token_uri=credentials_dict['token_uri'],
        client_id=credentials_dict['client_id'],
        client_secret=credentials_dict['client_secret'],
        scopes=credentials_dict['granted_scopes']
    )

    events = get_calendar_events(creds, calendar_id='primary', max_results = 50)

    processed_events = []
    for event in events:
        name = event.get('summary', 'No Title')

        # Extract start time info
        start_info = event.get('start', {})
        start_value = start_info.get('dateTime', start_info.get('date'))

        # Extract end time info
        end_info = event.get('end', {})
        end_value = end_info.get('dateTime', end_info.get('date'))

        try:
            parsed_start = dateutil.parser.parse(start_value)
            parsed_end = dateutil.parser.parse(end_value)

            day = parsed_start.strftime('%Y-%m-%d')
            # Determine if these events have a time component or are all-day events.
            start_time = parsed_start.strftime('%H:%M:%S') if 'T' in start_value else 'All day'
            end_time = parsed_end.strftime('%H:%M:%S') if 'T' in end_value else 'All day'
            # Optionally, compute the duration in hours/minutes
            duration = parsed_end - parsed_start
            duration_str = str(duration)
        except Exception as e:
            day = start_value  # fallback if parsing fails
            start_time = 'Unknown'
            end_time = 'Unknown'
            duration_str = 'Unknown'

        processed_events.append({
            'name': name,
            'day': day,
            'start_time': start_time,
            'end_time': end_time,
            'duration': duration_str  # You can remove this if you don't need it
        })
    return jsonify(events)





def get_calendar_events(creds, calendar_id='primary', max_results=50):
    service = build('calendar', 'v3', credentials=creds)
    
    user_time_zone = get_user_timezone(creds, calendar_id) #get the user's timezone
    
    query_params = {
        'calendarId': calendar_id,
        'maxResults': max_results,
        'singleEvents': True,
        'orderBy': 'startTime',
        'timeZone': user_time_zone 
    }
    
    events_result = service.events().list(**query_params).execute()
    events = events_result.get('items', [])
    return events



def get_user_timezone(creds, calendar_id='primary'):
    service = build('calendar', 'v3', credentials=creds)
    calendar = service.calendars().get(calendarId=calendar_id).execute()
    return calendar.get('timeZone', 'UTC') #default to UTC if not found





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

#this function is set up to check that the user authorized their calendar data to be used for PMI (they authorized it form the oauth2callback function)
@app.route('/calendar')
def calendar_api_request():
    if 'credentials' not in flask.session:
        return flask.redirect('authorize')
    features = flask.session['features']
    print("CALENDER API REQUESTED")
    # we will see if the credentials are valid for this user to test the google calendar api
    if features['calendar']:
        return ('<p>User granted the Google Calendar read permission. '+
                'This sample code does not include code to call Calendar</p>')
    else:
        return ('<p>User did not grant the Google Calendar read permission</p>')




  #push the calendar data
  #function to modify calendar data
  #calendar availability for people (using the user's calendar data)
  #function to add event
  #work on availability algo
  #


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