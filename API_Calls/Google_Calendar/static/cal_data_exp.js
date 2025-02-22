//this file exports calendar data from the google oauth (server_side)

function fetchCalendarData() {
    //get calendar data from app.py
    fetch('/api/calendar')
      .then(response => {
        if (!response.ok) {
          throw new Error('Bad network response: ' + response.statusText);
        }
        return response.json();
      })
      .then(calendarData => {
        console.log('Calendar Data: ', calendarData);
        storeEventsInFirebase(calendarData);
      })
      .catch(error => {
        console.error('Error fetching calendar data: ', error);
      });
  }
  
  function storeEventsInFirebase(events) {
    const userId = firebase.auth().currentUser.uid;
    const eventsCollection = firebase.firestore().collection('users').doc(userId).collection('events');
  
    events.forEach(event => {
      eventsCollection.doc(event.id).set({
        //if the user doesn't have a name, we will make the name stored as an empty string
        name: event.name || "",
        day: event.day || "",
        start: event.start.dateTime || event.start.date || "",
        end: event.end.dateTime || event.end.date || "",
        //additional data can be added here as needed
      })
      .then(() => {
        console.log(`Stored event ${event.id} successfully.`);
      })
      .catch(error => {
        console.error(`Error storing event ${event.id}:`, error);
      });
    });
  }
  
  //call this function when PMI loads or when you need to fetch calendar data
  fetchCalendarData();