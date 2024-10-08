import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, getDoc, doc, runTransaction, collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD4iapPT4rXMP_CmPe-yIfQm9PVgUcgqkw",
    authDomain: "bank-application-ca249.firebaseapp.com",
    projectId: "bank-application-ca249",
    storageBucket: "bank-application-ca249.appspot.com",
    messagingSenderId: "724398708214",
    appId: "1:724398708214:web:2b7a9f3aef0664f51e23d7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

function displayUserData(userData) {
    document.getElementById('name').innerText = userData.name;
    document.getElementById('email').innerText = userData.email;
    document.getElementById('balance').innerText = userData.min;
}

onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedIn');
    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    displayUserData(userData);
                } else {
                    console.log("No document found matching ID");
                }
            })
            .catch((error) => {
                console.log("Error getting document", error);
            });
    } else {
        console.log("User ID not found in local storage");
    }
});

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

async function transferFunds(senderId, receiverId, transferAmount) {
    const senderRef = doc(db, "users", senderId);
    const receiverRef = doc(db, "users", receiverId);

    try {
        await runTransaction(db, async (transaction) => {
            const senderDoc = await transaction.get(senderRef);
            if (!senderDoc.exists()) {
                throw new Error("Sender does not exist!");
            }

            if (senderId === receiverId) {
                throw new Error("Invalid transfer, cannot send to the same account");
            }

            const senderData = senderDoc.data();
            const senderBalance = senderData.min;

            if (senderBalance < transferAmount) {
                throw new Error("Insufficient funds!");
            }

            const receiverDoc = await transaction.get(receiverRef);
            if (!receiverDoc.exists()) {
                throw new Error("Receiver does not exist!");
            }

            const receiverData = receiverDoc.data();
            const receiverBalance = receiverData.min;

            transaction.update(senderRef, { min: senderBalance - transferAmount });
            transaction.update(receiverRef, { min: receiverBalance + transferAmount });
            transaction.update(senderRef, { lastPaymentTime: Timestamp.now() });
        });

        console.log("Transfer successful!");
        document.getElementById('message').innerText = "Transfer successful!";
        window.location.reload();
    } catch (error) {
        console.error("Transfer failed:", error.message);
        document.getElementById('message').innerText = `Transfer failed: ${error.message}`;
    }
}

async function getReceiverUidByEmail(email) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("No user found with this email.");
    }

    const userDoc = querySnapshot.docs[0];
    return userDoc.id;
}

const transferButton = document.getElementById('submit');
transferButton.addEventListener('click', async () => {
    const senderId = localStorage.getItem('loggedIn');
    const transferAmount = parseFloat(document.getElementById('amount').value);
    const receiverEmail = document.getElementById('nemail').value;

    if (receiverEmail && transferAmount > 0) {
        try {
            const receiverId = await getReceiverUidByEmail(receiverEmail);
            transferFunds(senderId, receiverId, transferAmount);
        } catch (error) {
            document.getElementById('message').innerText = error.message;
        }
    } else {
        document.getElementById('message').innerText = "Invalid receiver email or transfer amount.";
    }
});

const senderId = localStorage.getItem('loggedIn');
const senderRef = doc(db, "users", senderId);

if (senderId) {
    setInterval(async () => {
            try {
                await runTransaction(db, async (transaction) => {
                    const senderDoc = await transaction.get(senderRef);
                    const senderData = senderDoc.data();
                    let senderBalance = senderData.min;
                    const lastPaymentTime = senderData.lastPaymentTime;
                    const currentTime = Timestamp.now();
                    const timeDifference = Math.floor((currentTime.seconds - lastPaymentTime.seconds)/60); 
                    const charges = 1; 
        
                    if (senderBalance < 500 && timeDifference > 0) {
                        const totalCharges = timeDifference * charges;
                        senderBalance -= totalCharges
                        transaction.update(senderRef, {
                            min: senderBalance,
                            lastPaymentTime: currentTime
                        });
        
                        document.getElementById("balance").innerText = senderBalance;
                        console.log(`Charges applied: ${totalCharges} units for ${timeDifference} seconds`);
                    }
                });
            } catch (error) {
                console.error("Failed to apply time charges:", error);
                document.getElementById('message').innerText = "Failed to apply time charges";
            }
    }, 6000); 
}

const depositButton = document.getElementById("dep");
depositButton.addEventListener('click', async () => {
    const senderId = localStorage.getItem('loggedIn');
    const senderRef = doc(db, "users", senderId);
    try {
        await runTransaction(db, async (transaction) => {
            const senderDoc = await transaction.get(senderRef);
            const senderData = senderDoc.data();
            const senderBalance = senderData.min;
            const deposit = parseFloat(document.getElementById("own").value);
            transaction.update(senderRef, { min: senderBalance + deposit });
        });

        document.getElementById('message').innerText = "Deposit successful!";
        window.location.reload();
    } catch (error) {
        console.error("Deposit failed:", error.message);
        document.getElementById('message').innerText = "Deposit failed";
    }
});

const withdrawButton = document.getElementById("withdraw");
withdrawButton.addEventListener('click', async () => {
    const senderId = localStorage.getItem('loggedIn');
    const senderRef = doc(db, "users", senderId);
    try {
        await runTransaction(db, async (transaction) => {
            const senderDoc = await transaction.get(senderRef);
            const senderData = senderDoc.data();
            const senderBalance = senderData.min;
            const deposit = parseFloat(document.getElementById("with").value);
            transaction.update(senderRef, { min: senderBalance - deposit });
        });

        document.getElementById('message').innerText = "Withdraw successful!";
        window.location.reload();
    } catch (error) {
        console.error("Withdraw failed:", error.message);
        document.getElementById('message').innerText = "Withdraw failed";
    }
});