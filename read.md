//-------------------------------------------

import React, { useEffect, useState } from "react";
// import "./Apps.css";
// import WindowTracker from "../components/Main/WindowTracker";
// import Memes from "../components/Memes/Memes";
// import Header from "../components/Header/Header";
// import NavBar from "../components/NavBar/NavBar";
// import Main from "../components/Main/Main";
// import Joke from "../Joke/Joke";
// import jokesData from "../components/jokesData";
// import Sidebar from "../components/Notepad/Sidebar";
// import { render } from "react-dom";

import Sidebar from "../components/Notepad/Sidebar";
import Editor from "../components/Notepad/Editor";
import "../components/Notepad/style.css";
import Split from "react-split";
import { nanoid } from "nanoid";
// keeping the local and database datas in sync
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";

// now, let's reference the notesCollection from here
import { notesCollection, db } from "../firebase";

// --------small refactors
// import { data } from "../components/Notepad/data";---we are calling but not using it

export const  = () => {
  /**
   * Challenge:
   * 1. Every time the `notes` array changes, save it
   *    in localStorage. You'll need to use JSON.stringify()
   *    to turn the array into a string to save in localStorage.
   * 2. When the app first loads, initialize the notes state
   *    with the notes saved in localStorage. You'll need to
   *    use JSON.parse() to turn the stringified array back
   *    into a real JS array.
   */

  // ---------we gonna get rid of this because we're now having data sync from firestore db
  // const [notes, setNotes] = React.useState([]);
  // const [notes, setNotes] = React.useState(
  //   () => JSON.parse(localStorage.getItem("notes")) || []
  // );
  const [notes, setNotes] = React.useState([]);
  const [currentNoteId, setCurrentNoteId] = React.useState("");
  // (notes[0] && notes[0].id) || ""
  // -----optional chaining operator

  // since note will not be initialized with an array of notes object, we can just get rid of the notes object

  // notes[0]?.id || ""
  // );
  console.log(currentNoteId);

  // // Lazy State Initialization
  // const [state, setState] = useState(console.log("state initialization"));

  //-----instead of calling the function findCurrentNote twice,
  // we can just refactor it here
  // const currentNote = notes.find((note) => note.id === currentNoteId) || null;

  // ------------
  /**
   * Challenge:
   * 1. Set up a new state variable called `tempNoteText`. Initialize
   *    it as an empty string
   * 2. Change the Editor so that it uses `tempNoteText` and
   *    `setTempNoteText` for displaying and changing the text instead
   *    of dealing directly with the `currentNote` data.
   * 3. Create a useEffect that, if there's a `currentNote`, sets
   *    the `tempNoteText` to `currentNote.body`. (This copies the
   *    current note's text into the `tempNoteText` field so whenever
   *    the user changes the currentNote, the editor can display the
   *    correct text.
   * 4. TBA
   */
  const [tempNoteText, setTempNoteText] = useState("");

  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0];
  // // addition
  // useEffect(() => {
  //   localStorage.setItem("notes", JSON.stringify(notes));
  // }, [notes]);

  // --------------
  /**
   * Challenge:
   * 1. Add createdAt and updatedAt properties to the notes
   *    When a note is first created, set the `createdAt` and `updatedAt`
   *    properties to `Date.now()`. Whenever a note is modified, set the
   *    `updatedAt` property to `Date.now()`.
   *
   * 2. TBA   * 2. Create a new `sortedNotes` array (doesn't need to be saved
   *    in state) that orders the items in the array from
   *    most-recently-updated to least-recently-updated.
   *    This may require a quick Google search.
   *
   *
   */

  // ------------------------sorted notes
  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);

  // ------------useEffect for observing when the current note changes
  useEffect(() => {
    if (currentNote) {
      setTempNoteText(currentNote.body);
    }
  }, [currentNote]);

  // ----------------- debouncing
  // create an effect that runs any time the tempNoteText changes
  // goal - delay the sending of the request to Firebase
  // uses setTimeout
  // clear timeout to cancel the timeout if the useEffect runs again

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // let's do something real quick
      if (tempNoteText !== currentNote.body) {
        updateNote(tempNoteText);
      }
      // updateNote(tempNoteText);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [tempNoteText]);

  // ----------since we're going to be using the onSnapshot let's modify our useEffect
  useEffect(() => {
    //onSnapshot is going to take two parameters
    //1.collection we want to listen for changes to
    // 2.callback function that should get called whenever
    // there's a change to the notesCollection
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      // sync up our local notes array withe the snapshot data
      // console.log("things are changing");
      // next goal is to take the (snapshot) and to rearrange the
      //shape of the object therein so that it makes sense for the application
      //we are building for the notes array
      // instead of using nano id as firebase comes with their auto numbering

      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setNotes(notesArr); //because of this, we're going to get rid of
      //  any access to local storage that we were using before
    });

    return unsubscribe;
  }, []);

  // let's create another useEffect
  useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);

  async function createNewNote() {
    const newNote = {
      // id: nanoid(), //-----our firestore db is going to manage this id for us , so
      //we can take that away
      body: "# Type your markdown note's title here",
      createedAt: Date.now(), //Date.now() returns timestamp
      updatedAt: Date.now(),
    };
    // setNotes((prevNotes) => [newNote, ...prevNotes]); //----then instead of setting our
    //notes manually, snap shot is going to take of setting our notes array
    // let's use this new space to push our new doc. to firestore
    const newNoteRef = await addDoc(notesCollection, newNote);
    // setCurrentNoteId(newNote.id);
    setCurrentNoteId(newNoteRef.id);
  }

  async function updateNote(text) {
    // //let's get rid of this guy below and update our code
    // // Try to rearrange the most recently-modified
    // setNotes((oldNotes) => {
    //   //Create a new empty array
    //   //loop over the original array
    //   //if the id matches ,put the updated note at the beginning of the new array
    //   //else push the old note to the end of the new array
    //   //return the new array
    //   const newArray = [];
    //   for (let i = 0; i < oldNotes.length; i++) {
    //     const oldNote = oldNotes[i];
    //     if (oldNote.id === currentNoteId) {
    //       newArray.unshift({ ...oldNote, body: text });
    //     } else {
    //       newArray.push(oldNote);
    //     }
    //   }
    //   return newArray;
    // });
    // // ------- This does not rearrange the notes
    // // setNotes((oldNotes) =>
    // //   oldNotes.map((oldNote) => {
    // //     return oldNote.id === currentNoteId
    // //       ? { ...oldNote, body: text }
    // //       : oldNote;
    // //   })
    // // );
    // -----------------------------
    const docRef = doc(db, "notes", currentNoteId);
    await setDoc(
      docRef,
      { body: text, updatedAt: Date.now() },
      { merge: true }
    );
  }

  /**
   * Challenge: complete and implement the deleteNote function
   *
   * Hints:
   * 1. What array method can be used to return a new
   *    array that has filtered out an item based
   *    on a condition?
   * 2. Notice the parameters being based to the function
   *    and think about how both of those parameters
   *    can be passed in during the onClick event handler
   */

  //  let's add functionality to our delete function
  //let's update it too
  // function deleteNote(event, noteId) {
  async function deleteNote(noteId) {
    // we do not need this propagation guy anymore too
    // event.stopPropagation();
    //your code here
    // console.log("deleting note", noteId);
    // we're no longer setting our old notes manually
    // to delete from firestore, you get reference to the doc. you're trying to delete and import that at the top
    // setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId));
    // now, let's use our doc to delete and pass in three args. here
    const docRef = doc(db, "notes", noteId);
    await deleteDoc(docRef);
  }
  // ----let's comment this guy since we created a currentNote up there
  // function findCurrentNote() {
  //   return (
  //     notes.find((note) => {
  //       return note.id === currentNoteId;
  //     }) ||
  //     notes[0] ||
  //     null //modified to "|| null"
  //   );
  // }
  // scrimba
  // return (
  // <main>
  //   {notes.length > 0 ? (
  //     <Split sizes={[30, 70]} direction="horizontal" className="split">
  //       <Sidebar
  //         notes={notes}
  //         currentNote={findCurrentNote()}
  //         setCurrentNoteId={setCurrentNoteId}
  //         newNote={createNewNote}
  //       />
  //       {currentNoteId && notes.length > 0 && (
  //         <Editor currentNote={findCurrentNote()} updateNote={updateNote} />
  //       )}
  //     </Split>
  //   ) : (
  //     <div className="no-notes">
  //       <h1>You have no notes</h1>
  //       <button className="first-note" onClick={createNewNote}>
  //         Create one now
  //       </button>
  //     </div>
  //   )}
  // </main>

  //modified----claude AI
  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction="horizontal" className="split">
          <Sidebar
            // notes={notes} //instead of passing in our notes, we gonna pass in sortedNotes
            notes={sortedNotes}
            currentNote={currentNote}
            setCurrentNoteId={setCurrentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
          />
          {/* we can actually do away with this conditional rendering */}
          {/* {currentNoteId && notes.length > 0 && ( */}
          {/* we don't want the editor to update on every keystroke */}
          {/* <Editor currentNote={currentNote} updateNote={updateNote} />  */}
          <Editor
            tempNoteText={tempNoteText}
            setTempNoteText={setTempNoteText}
          />

          {/* )} */}
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
};

// export default Apps;

// -----------------firebase and speaking with it

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCQYUBp_ep_jlNrDYKHRuXx0xXfje_TR4Q",
//   authDomain: "react-notes-ccbfe.firebaseapp.com",
//   projectId: "react-notes-ccbfe",
//   storageBucket: "react-notes-ccbfe.appspot.com",
//   messagingSenderId: "833402055570",
//   appId: "1:833402055570:web:67fa9942eec87b5c222f4b"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
