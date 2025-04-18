import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [isValidUser, setIsValidUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Helper function to get a cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  useEffect(() => {
    const checkUserValidity = async () => {
      try {
        // Read UID and email from cookies
        const uid = getCookie("uid");
        const email = getCookie("email");

        if (!uid || !email) {
          console.error("No valid cookies found. User is not logged in.");
          setIsValidUser(false);
          setLoading(false);
          return;
        }

        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if the cookie's UID and email match the Firestore data
          if (userData.uid === uid && userData.email === email) {
            console.log("User is valid.");
            setIsValidUser(true);
            setUserInfo(userData); // Store user data to display it
          } else {
            console.error("Cookie data does not match Firestore data.");
            setIsValidUser(false);
          }
        } else {
          console.error("User not found in Firestore.");
          setIsValidUser(false);
        }
      } catch (error) {
        console.error("Error checking user validity:", error);
        setIsValidUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserValidity();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isValidUser) {
    return <div>User is not valid. Please log in again.</div>;
  }

  return (
    <div>
      <h1>Welcome to the App!</h1>
      <p>You are logged in as a valid user.</p>
      <h2>User Information:</h2>
      <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
        {JSON.stringify(userInfo, null, 2)}
      </pre>
    </div>
  );
}

export default App;
