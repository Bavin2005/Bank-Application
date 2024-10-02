import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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

const signIn = document.getElementById("btn")
signIn.addEventListener('click', (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value
  const pass = document.getElementById("pass").value
  const auth = getAuth()
  signInWithEmailAndPassword(auth,email,pass)
  .then(
    (userCredential) => {
        const user = userCredential.user
        localStorage.setItem("loggedIn",user.uid)
        window.location.href = 'details.html'
    }
  )
  .catch((error) => {
    const errorcode = error.code
    if(errorcode === 'auth/invalid-credential'){
        showMessage("Invalid Email or Password","signinmessage")
    }
    else{
        showMessage("Account Does not Exist", "signinmessage")
    }
  })
})
