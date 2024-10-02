import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4iapPT4rXMP_CmPe-yIfQm9PVgUcgqkw",
  authDomain: "bank-application-ca249.firebaseapp.com",
  projectId: "bank-application-ca249",
  storageBucket: "bank-application-ca249.appspot.com",
  messagingSenderId: "724398708214",
  appId: "1:724398708214:web:2b7a9f3aef0664f51e23d7"
};

function showMessage(messageText, divId) {
  const messageElement = document.getElementById(divId); 
  messageElement.style.display = "block";
  messageElement.innerHTML = messageText;
  messageElement.style.opacity = 1;

  setTimeout(function() {
    messageElement.style.opacity = 0;
  }, 3000);
}

const app = initializeApp(firebaseConfig);

const signup = document.getElementById("rbtn");
signup.addEventListener('click', (event) => {
  event.preventDefault();
  
  const email = document.getElementById("remail").value;
  const pass = document.getElementById("rpass").value;
  const name = document.getElementById("rname").value;
  const min = 1000

  const auth = getAuth();
  const db = getFirestore();

  createUserWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      const user = userCredential.user;
      const data = {
        name: name,
        email: email,
        password : pass,
        min : 1000
      };

      showMessage("Account Created Successfully", "signupmessage");

      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, data)
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch((error) => {
          console.error("Error saving user data to Firestore:", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showMessage("Email Already Exists", "signupmessage");
      } else {
        showMessage("An error occurred. Please try again.", "signupmessage");
      }
    });
});

  

