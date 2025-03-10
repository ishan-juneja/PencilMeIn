import db from "./firebaseClient";
import { collection, addDoc, getDocs } from "firebase/firestore"; 



const colRef = collection(db, 'pmi_event')

//GET grabbing documnets from pmi_event from the firebase
getDocs(colRef).then((snapshot) => {
        let eventData = []
        snapshot.docs.forEach((doc) => {
            eventData.push({ ...doc.data(), id: doc.id })
        })
        console.log("Jason tatum")
        console.log(eventData)
    })
    .catch(err =>{
        console.log(err.message)
    })




// async function add_PMI_docs(addDate, addTime, addEventName, addDateDropdowns, startTime){
//     try{
//         await addDoc(colRef), {
//             starting_time: startTime,

//         }
//     }
//     catch(e) {
//         console.error("Error adding document: ", e);
//     }
// }


//POST adding documents:
// const addDate = document.querySelector('.create-event-button')
// const addEndTime = document.querySelector('.ending-dropdown')
// const addEventName = document.querySelector('.home-container')
// const addDateDropdowns = document.querySelector('.dates-dropdown-option')
// const addStartTime = document.querySelector9('.starting-dropdown')


// addPMI.addEventListener('submit', (e) => {
//     e.preventDefault()

//     addDoc(colRef, {
//         dates: addDate.dates.value,
//         end_time: addEndTime.value,
//         event_name: addEventName.eventName.value, //no return value on the console
//         specific_dates: true, //not sure how this works so i'll just put in a boolean value of true
//         starting_time: addStartTime.value,
//     }) 


// })






//deleting documents (not sure how useful this will be yet)
// const deletePMI = document.querySelector('.delete')
// deletePMI.addEventListener('submit', (e) => {
//     e.preventDefault()

//     const docRef = doc(db, 'pmi_event', )
// })