import React, { useContext } from "react";

export const FirebaseContext = React.createContext();

export const useFirebase = () => {
  const firebaseContext = useContext(FirebaseContext);
  if (firebaseContext === undefined) {
    throw new Error(
      "useFirebase must be used within a FirebaseContext.Provider"
    );
  }
  return firebaseContext;
};