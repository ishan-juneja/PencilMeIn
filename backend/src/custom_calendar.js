import db from "./firebaseClient";
import { collection, addDoc, getDocs } from "firebase/firestore"; 



const colRef = collection(db, 'custom_calendar')

//grabbing documnets (calendar data) from the firebase
getDocs(colRef).then((snapshot) => {
        let calendarData = []
        snapshot.docs.forEach((doc) => {
            calendarData.push({ ...doc.data(), id: doc.id })
        })
        console.log(calendarData)
    })
    .catch(err =>{
        console.log(err.message)
    })

// POST adding documents (calendar data)
// const addDates = document.querySelector('.add')
// const addCalName = document.querySelector('.my-calendar-event-input')
// const addTimeZone = document.querySelector('.')

// addDates.addEventListener('submit', (e) =>{
//     e.preventDefault()

//     addDoc(colRef, {
//         end_time: addDates.  .value,
//         event_name: addDates.  .value,
//         start_time: addDates.  .value,
//     }) //find the property values from the frontend to get the calendar dates
//     .then(()=>{

//     })
// })

//deleting document (calendar data) (not sure how needed this is)
// const deleteDates = document.querySelector('.delete')
// deleteDates.addEventListener('submit', (e  =>{
//     e.preventDefault()

//     const docRef = doc(db, 'custom_calendar', deleteDates. )

// }))

//note that for both adding and deleting documents, this will all be grabbing the data from the frontend.
//get to know how the frontend works w/ frontend team and see which html class they used to add/delete calendar dates so that we can ensure smooth connection






export default app;