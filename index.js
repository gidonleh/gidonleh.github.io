/* -----------------------------------------
  firebase 
 ---------------------------------------- */


 var firebaseConfig = {
  apiKey: "AIzaSyAHZd6Uvdb0N9b0z0Npld2CgMMRz0_J90A",
  authDomain: "contact-form-7ab67.firebaseapp.com",
  databaseURL: "https://contact-form-7ab67.firebaseio.com",
  projectId: "contact-form-7ab67",
  storageBucket: "contact-form-7ab67.appspot.com",
  messagingSenderId: "336453571410",
  appId: "1:336453571410:web:fc4d89666e91fa32fde08b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//reference messages collection
let messagesRef = firebase.database().ref('messages');

function onMessageCreate(){
  functions.database.ref('messages').onCreate()
}
/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

let alterStyles = (isBackToTopRendered) => {
  backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
  backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
  backToTopButton.style.transform = isBackToTopRendered
    ? "scale(1)"
    : "scale(0)";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > 700) {
    isBackToTopRendered = true;
    alterStyles(isBackToTopRendered);
  } else {
    isBackToTopRendered = false;
    alterStyles(isBackToTopRendered);
  }
});

// Listen for form submit

document.getElementById('contactform').addEventListener('submit', submitForm);

function submitForm(e) {
  e.preventDefault();

  //get values
  let name = getInputVal('name');
  let email = getInputVal('email');
  let phone = getInputVal('phone');
  let message = getInputVal('message');

  saveMessage(name, email, phone, message);

  document.getElementById('contactform').reset();
}
// function to get form values
function getInputVal(id){
  return document.getElementById(id).value;
}

// save message to firebase
function saveMessage(name, email, phone, message){
  let newMessageRef = messagesRef.push();
  newMessageRef.set({
    name: name,
    email: email,
    phone: phone,
    message: message
  }) 
}