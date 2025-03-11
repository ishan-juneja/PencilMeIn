#download the following dependencies: flask, authlib.integrations.flask_client, google-api-python-client, google-auth-httplib2, google-auth-oauthlib
#we will be requesting from the browser: http://localhost:5000 (this is the authorized javascript origin)
import os
import flask
from flask import jsonify, render_template, url_for
from google.oauth2.credentials import Credentials
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import dateutil.parser
from dotenv import load_dotenv
from datetime import datetime, timezone
from collections import defaultdict
import firebase_admin
from firebase_admin import firestore, credentials
import uuid



cred = credentials.Certificate("pencilmein-e7ac3-firebase-adminsdk-fbsvc-e3d41e63ed.json")
firebase_admin.initialize_app(cred)
db = firestore.client()




OAUTHLIB_INSECURE_TRANSPORT=1
OAUTHLIB_RELAX_TOKEN_SCOPE=1

load_dotenv()
CLIENT_SECRETS_FILE = '.credentials.json'
SCOPES = ['https://www.googleapis.com/auth/calendar', 'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'] #this scope will allow PMI to read the user's calendar events as well as put in new event
API_SERVICE_NAME = 'calendar'
API_VERSION = 'v3'

app = flask.Flask(__name__) 
app.secret_key = os.getenv("SECRET_KEY")



@app.route('/create_event')
def create_event():
    if 'credentials' not in flask.session:
        flask.session['next'] = flask.request.path
        return flask.redirect(url_for('google_authorize'))
    
    event_id = str(uuid.uuid4())
    shared_event_ref = db.collection('shared_events').document(event_id)
    shared_event_ref.set({
        'created_by': flask.session['email'],  
        'availabilities': {}   
    })
    return flask.redirect(url_for('shared_event', event_id=event_id))

@app.route('/event/<event_id>')
def shared_event(event_id):
    # Require authentication: if not signed in, redirect to auth and save next URL
    if 'credentials' not in flask.session:
        flask.session['next'] = flask.request.path
        return flask.redirect(url_for('google_authorize'))
    
    print(flask.session['email'])

    email = flask.session['email']


    shared_event_ref = db.collection('shared_events').document(event_id)
    shared_event_ref.update({
    'users': firestore.ArrayUnion([flask.session["email"]])
    })  

    users = db.collection('shared_events').document(event_id).get()

    all_users = users.to_dict().get('users')
    
    availabilities = compare_people(all_users)

    converted_availability = {
    " | ".join(key): value for key, value in availabilities.items()
    }



    event_ref = db.collection('shared_events').document(event_id)

    event_ref.set({
     'availabilities': converted_availability
    }, merge=True)



    user_ref = db.collection('users').document(email)
    user_ref.update({
    'shared_events': firestore.ArrayUnion([{'event_id': event_id, 'ref': event_ref}])
    })


 
    
    # Render a template that displays the shared event planning page
    # (This template can include JavaScript to allow users to update their availability)
    return(render_template("create_event.html"))


@app.route('/')
def index():
    return render_template('index.html')


def find_available_intervals(events):
    start_hour = 9  # Earliest hour to start the schedule
    end_hour = 23  # Latest hour to end the schedule
    start_date = datetime.now(timezone.utc).isoformat()
    week_start = datetime.fromisoformat(start_date)

    weekly_availability = {}

    for i in range(7):  
        current_date = (week_start + timedelta(days=i)).date().isoformat()
        day_start = datetime.fromisoformat(f"{current_date}T{start_hour:02d}:00:00").replace(tzinfo=timezone.utc)
        day_end = datetime.fromisoformat(f"{current_date}T{end_hour:02d}:00:00").replace(tzinfo=timezone.utc)

        time_slots = []
        current_time = day_start
        while current_time < day_end:
            next_time = current_time + timedelta(minutes=30)
            time_slots.append((current_time, next_time, 1)) 
            current_time = next_time

        busy_times = []
        for event in events:
            start_info = event.get('start', {})
            end_info = event.get('end', {})

            start_time = start_info.get('dateTime', start_info.get('date'))
            end_time = end_info.get('dateTime', end_info.get('date'))

            if start_time and end_time:
                start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

                if start_dt.date().isoformat() == current_date:
                    busy_times.append((start_dt, end_dt))


        busy_times.sort()

        for busy_start, busy_end in busy_times:
            for idx, (slot_start, slot_end, availability) in enumerate(time_slots):
                if slot_start < busy_end and slot_end > busy_start:
                    time_slots[idx] = (slot_start, slot_end, 0)  

        weekly_availability[current_date] = [(slot[0].strftime("%I:%M %p"), slot[2]) for slot in time_slots]

    return weekly_availability

def find_busy_times(events):
    
    
    weekly_availability = {}

    
    week_start = datetime.now()  # or however you define the week start date
    start_hour = 9
    end_hour = 23

    for i in range(7):
        # Compute the current date as an ISO string (YYYY-MM-DD)
        current_date = (week_start + timedelta(days=i)).date().isoformat()
       
        
        busy_times = []
        # Loop through the events and add the ones that match the current date
        for event in events:
            if event.get('day') == current_date:
                # Build datetime objects from the event's start and end times
                start_str = f"{current_date}T{event.get('start_time')}"
                end_str = f"{current_date}T{event.get('end_time')}"
                start_dt = datetime.fromisoformat(start_str)
                end_dt = datetime.fromisoformat(end_str)
                busy_times.append((start_dt, end_dt))
        
        busy_times.sort()

       

        weekly_availability[current_date] = busy_times

    return weekly_availability

from datetime import datetime, timedelta, timezone

def format_availability(busy_times):
    formatted_availability = {}

    start_hour = 9
    end_hour = 23

    # Iterate over each date in the busy_times dictionary
    for current_date, busy_intervals in busy_times.items():
        intervals = []
        # Create the day's start and end datetime objects (naive)
        day_start = datetime.fromisoformat(f"{current_date}T{start_hour:02d}:00:00")
        day_end = datetime.fromisoformat(f"{current_date}T{end_hour:02d}:00:00")
        current_time = day_start

        # Create 30-minute slots throughout the day
        while current_time < day_end:
            next_time = current_time + timedelta(minutes=30)
            available = 1  # Assume the slot is available

            # Check if any busy interval overlaps with this slot
            for start, end in busy_intervals:
                # Remove timezone info if present (or ensure both are naive)
                start = start.replace(tzinfo=None)
                end = end.replace(tzinfo=None)
                # If the busy interval overlaps with the current slot, mark as unavailable
                if start < next_time and end > current_time:
                    available = 0
                    break

            intervals.append({
                "start": current_time.strftime("%I:%M %p"),
                "end": next_time.strftime("%I:%M %p"),
                "available": available
            })
            current_time = next_time

        formatted_availability[current_date] = {"availability": intervals}

    return formatted_availability



def store_calendar(events):
    user_id = flask.session['email']
    print("USER_ID" + user_id)

    
    user_ref = db.collection('users').document(user_id) 

    if not user_ref.get().exists:
        user_ref.set({
            'user_id': user_id,
            # Add any additional default user fields here
        })
    events_ref = user_ref.collection('calendar_events') 

    for event in events:
        event_id = event['id']
        event_name = event.get('summary', 'No Title')

        start_info = event.get('start', {})
        end_info = event.get('end', {})

        start_time = start_info.get('dateTime', start_info.get('date'))  
        end_time = end_info.get('dateTime', end_info.get('date'))

        try:
            parsed_start = datetime.fromisoformat(start_time)
            parsed_end = datetime.fromisoformat(end_time)
            duration = parsed_end - parsed_start
            duration_str = str(duration)  
        except Exception:
            duration_str = "Unknown"

        event_data = {
            'event_name': event_name,
            'start_time': start_time,
            'end_time': end_time,
            'duration': duration_str
        }

        events_ref.document(event_id).set(event_data)


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
    flask.session['userId'] = str(uuid.uuid4())
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

    print(creds_dict)

    creds = Credentials(
        token = creds_dict['token'],
        refresh_token = creds_dict['refresh_token'],
        token_uri = creds_dict['token_uri'],
        client_id = creds_dict['client_id'],
        client_secret = creds_dict['client_secret'],
        granted_scopes = creds_dict['granted_scopes']
    )




    service = build('calendar', 'v3', credentials = creds)

    people_service = build('people', 'v1', credentials=creds)
    profile = people_service.people().get(
        resourceName='people/me',
        personFields='names,emailAddresses'
    ).execute()
   

    list_profile = profile.get("emailAddresses", [])

    current_dict = list_profile[0]

    print("current_dict")
    print(current_dict)

    print(current_dict['value'])


    flask.session['email'] = current_dict['value']

    # people_service = build('people', 'v1', credentials=creds)
    # profile = people_service.people().get(
    #     resourceName='people/me',
    #     personFields='names,emailAddresses'
    # ).execute()

    # print(profile.get("emailAdresses", []))

    now = datetime.now(timezone.utc)
    end_time = now + timedelta(days = (6-now.weekday()))

    
    #event = service.events().get(calendarId='primary', eventId='eventId').execute()
    events_result = service.events().list(
    calendarId='primary',
    timeMin=now.isoformat(), 
    timeMax = end_time.isoformat(), # This ensures only future events are retrieved
    singleEvents=True,
    orderBy='startTime').execute()
 #this will scrape all of the calendar events from the user's primary calendar
    events = events_result.get('items', [])

    print("BRODIE")
    events = get_calendar_events(creds)


    print("HERE!!!")
    print(events)
    #store_calendar(events)


    busy_times  = find_busy_times(events)



    print("HELL:::!$%")
    print(busy_times)


    formatted_calendar = format_availability(busy_times)

    print(formatted_calendar)
    
    add_user_availability(formatted_calendar)

    #compare_people(['Arjun'])

    #for testing purposes:
    #
    

    flask.session['credentials'] = creds_dict

    features = check_granted_scopes(creds_dict)
    flask.session['features'] = features
    return flask.redirect('/')



def add_user_availability(time_arr):
    user_ref = db.collection('users').document(flask.session['email'])
    availability_ref = user_ref.collection("availability")

    availability_ref.document("availability").set(time_arr)




def compare_people(people):
    total_availability = defaultdict(int)
    for p in people:
        user_ref = db.collection("users").document(p)
        user_doc = user_ref.collection('availability').document('availability').get()
        print(type(user_doc))
        for date, data in user_doc.to_dict().items():
            for slot in data['availability']:
                time = (date, slot["start"], slot["end"])
                if slot["available"]:
                    total_availability[time] += 1
                else:
                    total_availability[time] = 0
    
    return total_availability



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


    print(events)
    return jsonify(events)





def get_calendar_events(creds, calendar_id='primary', max_results=50):
    service = build('calendar', 'v3', credentials=creds)
    
    user_time_zone = get_user_timezone(creds, calendar_id) #get the user's timezone
    now_time = datetime.now(timezone.utc)
    end_time = now_time + timedelta(days = 7)
    query_params = {
        'calendarId': calendar_id,
        'maxResults': max_results,
        'singleEvents': True,
        'orderBy': 'startTime',
        'timeZone': user_time_zone ,
        'timeMin': now_time.isoformat(),
        'timeMax': end_time.isoformat() 
    }
    
    events_result = service.events().list(**query_params).execute()
    events = events_result.get('items', [])

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

    return processed_events



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