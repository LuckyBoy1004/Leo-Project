import React, { createContext, useState, useEffect, useContext } from "react";
import firebase from "firebase/app";
import { useFirebase } from "../assets/base-context";
import publicIp from "public-ip";

import Stripe from "stripe";
import functions from "firebase/firebase-functions";
import { inputAdornmentClasses } from "@mui/material";

var SibApiV3Sdk = require("sib-api-v3-sdk");

var defaultClient = SibApiV3Sdk.ApiClient.instance;

let myAPIKey = process.env.REACT_APP_SENDINBLUE_APIKEY;
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = myAPIKey;

var partnerKey = defaultClient.authentications["partner-key"];
partnerKey.apiKey = process.env.REACT_APP_SENDINBLUE_APIKEY;

var apiInstance = new SibApiV3Sdk.ContactsApi();
var createContact = new SibApiV3Sdk.CreateContact();

var apiInstanceSend = new SibApiV3Sdk.TransactionalEmailsApi();
var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

// Ce fichier comporte toutes les fonctions d'appels et de traitement bdd, et du context global.
// Il englobe l'app dans App.js

export const UserContext = createContext();

export function useAuth() {
  return useContext(UserContext);
}

export const UserProvider = ({ children }) => {
  const firebaseContext = useFirebase();
  const auth = firebaseContext.auth();
  const provider = firebaseContext.provider();
  const storage = firebaseContext.storage();
  const firestore = firebaseContext.firestore();

  let datePlusYear = new Date();
  datePlusYear.setFullYear(datePlusYear.getFullYear());

  const initialEvent = {
    name: "",
    date: datePlusYear,
    startAt: 0,
    endAt: 86360,
    people: 50,
    placeSize: 250,
    place: "",
    latLng: [],
    budget: 50,
    budgetLeft: 0,
    status: null,
    id: null,
    choosedServices: [],
  };

  const initialSeller = {
    companyName: "",
    adress: "",
    siret: "",
    website: "",
    firstName: "",
    holiday: "",
    lastName: "",
    phone: "",
    description: "",
    category: "",
    subcategory: "",
    status: "",
    image_path: "",
  };

  const [user, setUser] = useState();
  const [seller, setSeller] = useState(initialSeller);
  const [event, setEvent] = useState(initialEvent);

  const [loading, setLoading] = useState(true);
  const [currentStepProcess, setCurrentStepProcess] = useState(0);
  const [loadingButtonAddToCard, setLoadingButtonAddToCard] = useState(true);

  const refUsers = firestore.collection("users");
  const refEvents = firestore.collection("events");
  const refSellers = firestore.collection("sellers");
  const refSales = firestore.collection("sales");

  const [homeSellersDisplay, setHomeSellersDisplay] = useState([]);

  const [isCardWidgetOpen, setIsCardWidgetOpen] = useState(false);

  const createStripeCheckout = user
    ? firebase.functions().httpsCallable("createStripeCheckout")
    : null;
  const createStripeSubscribe = firebase
    .functions()
    .httpsCallable("createStripeSubscribe");
  const stripe =
    user || seller
      ? window.Stripe(
          "pk_test_51InLbZBwyEuW61Pj3yTYQlp31JobhK9vIKh32GColDUhXcdtzaKhWF5mVRDa9SGw7HujSuEDPCwvh40GEuo6uJxA00iqmaUXQp"
        )
      : null;

  const checkStripeReturn =
    user || seller
      ? firebase.functions().httpsCallable("checkStripeReturn")
      : null;

  useEffect(() => {
    auth.onAuthStateChanged((data) => {
      return handleAuthChanged(data);
    });
  }, []);

  async function handleAuthChanged(data) {
    if (data) {
      const isSeller = await isThisUserSeller(data.uid);
      const isUser = await isThisUserUser(data.uid);
      if (isSeller && !isUser) {
        const sellerData = await getSellerDataFromDB(data.uid);
        const sellerServices = await getServicesOfCurrentSellerFromDB();
        setSeller({
          ...initialSeller,
          ...data,
          ...sellerData,
          services: sellerServices,
        });
        setUser();
        setLoading(false);
      } else if (isUser && !isSeller) {
        if (data.emailVerified === false) {
          setUser();
          setSeller();
          setLoading(false);
          return;
        }
        setUser(data);
        setSeller();
        const eventData = await getEvent(data.uid);
        eventData && eventData !== null
          ? await getChoosedServices(eventData)
          : setEvent(initialEvent);
        setLoading(false);
      } else if (isSeller && isUser) {
        const sellerData = await getSellerDataFromDB(data.uid);
        setSeller({ ...initialSeller, ...data, ...sellerData });
        setUser(data);
        const eventData = await getEvent(data.uid);
        eventData && eventData !== null
          ? await getChoosedServices(eventData)
          : setEvent(initialEvent);
        setLoading(false);
      }
    } else {
      setSeller();
      setUser();
      setLoading(false);
    }
  }

  async function getSellerDataFromDB(id) {
    const query = await refSellers.doc(id).get();
    const result = query.data();
    return result;
  }

  async function isThisUserSeller(id) {
    const doc = await refSellers.doc(id).get();
    if (doc.exists) return true;
    return false;
  }

  async function isThisUserUser(id) {
    const doc = await refUsers.doc(id).get();
    if (doc.exists) return true;
    return false;
  }

  async function getEvent(uid) {
    const getEvent = await refEvents.where("user", "==", uid).get();
    if (getEvent.docs.length > 0) {
      let item = {};
      getEvent.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status && data.status !== "passed") {
          item = { ...data };
          item.date = data.date.toMillis();
          item.id = doc.id;
        }
      });
      return item && item.status && item.status !== "passed" ? item : null;
    } else {
      return null;
    }
  }

  async function addEvent(item) {
    const myEvent = { ...item };
    delete myEvent.id;
    let myNewEvent;

    if (item.status !== "creating") {
      myNewEvent = await createEvent(myEvent);
    }

    if (item.status === "creating") {
      // event existant
      myNewEvent = await updateEvent(item, myEvent);
    }
    await getChoosedServices(myNewEvent);
  }

  async function createEvent(myEvent) {
    const req = await refUsers.doc(myEvent.user).get();
    const res = req.data();
    var identifier = res.email;

    var updateContact = {
      attributes: {
        NOTIF_DATE: new Date(myEvent.date),
        EVENTID: event.id,
      },
    };

    apiInstance.updateContact(identifier, updateContact).then(
      () => {},
      (error) => {
        console.error(error);
      }
    );

    myEvent.status = "creating";
    const docRef = await refEvents.add({
      ...myEvent,
      date: new Date(myEvent.date),
    });
    myEvent.id = docRef.id;
    return myEvent;
  }

  async function updateEvent(item, myEvent) {
    if (item.place !== event.place) {
      const getServices = await refEvents
        .doc(item.id)
        .collection("services")
        .get();
      getServices.docs.forEach(async (doc) => {
        await refEvents
          .doc(item.id)
          .collection("services")
          .doc(doc.id)
          .delete();
      });
    }

    await refEvents.doc(item.id).update({
      ...myEvent,
      date: new Date(myEvent.date),
    });
    myEvent.id = item.id;
    return myEvent;
  }

  async function getBudgetLeft(budget, choosedServices) {
    let totalPrice = 0;
    choosedServices.forEach((item) => {
      if (item.variations && item.variations.length > 0) {
        totalPrice +=
          item.variations.filter((vari) => vari.name === item.variation)[0]
            .price * item.quantity;
      } else totalPrice += item.price * item.quantity;
    });
    const result = budget - totalPrice;
    return result;
  }

  async function getChoosedServices(item) {
    let choosedServices = [];
    const services = await refEvents.doc(item.id).collection("services").get();
    services.forEach((doc) => {
      choosedServices.push({ ...doc.data(), uid: doc.id });
    });
    const queryPrice = await getBudgetLeft(item.budget, choosedServices);
    const neWObject = {
      ...item,
      budgetLeft: queryPrice,
      choosedServices: choosedServices,
    };
    return setEvent(neWObject);
  }

  async function login(email, password) {
    return await auth
      .signInWithEmailAndPassword(email, password)
      .then((data) => {
        if (data.user.emailVerified === false) {
          setSeller();
          setUser();
          return false;
        }
        setUser(data.user);
        return true;
      });
  }

  async function verifyLogin(email, password) {
    const data = await auth.signInWithEmailAndPassword(email, password);
    return data;
  }

  async function subscribe(
    email,
    password,
    firstName,
    name,
    tel,
    gender,
    birthDate
  ) {
    return auth
      .createUserWithEmailAndPassword(email, password)
      .then(async (userData) => {
        await userData.user.updateProfile({
          displayName: firstName,
        });
        await refUsers
          .doc(userData.user.uid)
          .set({
            firstName: firstName,
            name: name,
            tel: tel,
            gender: gender,
            birthDate: birthDate,
            email: email,
          })
          .catch((error) => {
            return console.log(error);
          });
        userData.user.sendEmailVerification();
        setUser();
        setSeller();
        sendInBlue_addContactSubscribe(email, firstName);
        return true;
      })
      .catch((error) => {
        return error.code;
      });
  }

  async function sellerSubscribe(
    companyName,
    adress,
    siret,
    website,
    firstName,
    holiday,
    lastName,
    email,
    phone,
    password,
    latLng,
    referral
  ) {
    const referralToken =
      Date.now().toString().substr(0, 5) +
      Math.random().toString().substr(2, 7);
    return auth
      .createUserWithEmailAndPassword(email, password)
      .then(async (userData) => {
        await userData.user.updateProfile({
          displayName: firstName,
        });
        await refSellers
          .doc(userData.user.uid)
          .set({
            companyName: companyName,
            adress: adress,
            latLng: latLng,
            siret: siret,
            website: website,
            firstName: firstName,
            holiday: [],
            lastName: lastName,
            phone: phone,
            email: email,
            image_path: "",
            status: "subscribing",
            referralToken: referralToken,
            referral: referral,
          })
          .catch((error) => {
            return console.log(error);
          });
        if (referral.length === 12) {
          await updateSellerAfterReferralNewSeller(referral, userData.user.uid);
          sendInBlue_sendToParrainAboutNewReferral(referral);
        }
        sendInBlue_addContactSubscribe(
          email,
          firstName,
          lastName,
          userData.user.uid
        );
        setUser();
        setSeller({
          companyName: companyName,
          adress: adress,
          latLng: latLng,
          siret: siret,
          website: website,
          firstName: firstName,
          holiday: [],
          lastName: lastName,
          phone: phone,
          email: email,
          image_path: "",
          status: "subscribing",
          referralToken: referralToken,
          referral: referral,
          uid: userData.user.uid
        });
        userData.user.sendEmailVerification();
        return true;
      })
      .catch((error) => {
        return error.code;
      });
  }

  async function saveHoliday(id, holi, year, month) {
    await deleteHoliday(id, year, month)
    for (let i = 0; i < holi.length; i++) {
      refSellers
      .doc(id)
      .update({
        holiday: firebase.firestore.FieldValue.arrayUnion(holi[i]),
      })
      .catch((error) => {
        return console.log(error);
      });
    }
    return true;
  }

  async function deleteHoliday(id, year, month) {

    const selectMonth = await refSellers.doc(id).get();
    const updateMonth = selectMonth.data().holiday;
    if (updateMonth!=undefined) {
      for (let i = 0; i < updateMonth.length; i++) {
        var monthArray = updateMonth[i].split('.');
        if (monthArray[0] == year && monthArray[1] == month) {
          updateMonth.splice(i,1);
          i--;
        }
      } 
      refSellers
      .doc(id)
      .update({
        holiday: updateMonth,
      })
      .catch((error) => {
        return console.log(error);
      });
    }
  }

  async function updateSellerAfterReferralNewSeller(referral, newSellerUid) {
    const docs = await refSellers.where("referralToken", "==", referral).get();
    let docSeller = {};
    docs.forEach((doc) => {
      docSeller = { ...doc.data(), uid: doc.id };
    });
    if (
      docSeller.uid !== undefined &&
      docSeller.uid !== null &&
      docSeller.uid.length > 10
    ) {
      refSellers
        .doc(docSeller.uid)
        .collection("referral")
        .add({
          newSeller: newSellerUid,
          date: Date.now(),
        })
        .catch((error) => {
          return console.log(error);
        });
    }
  }

  function logout() {
    return auth.signOut();
  }

  async function signInWithGoogle() {
    const result = await auth.signInWithPopup(provider);
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    var doc = await refUsers.doc(user.uid).get();
    if (doc.exists) {
      setUser(auth.currentUser);
    } else {
      await refUsers.doc(user.uid).set({
        firstName: user.displayName,
        email: user.email,
      });
      setUser(auth.currentUser);
    }
  }

  // Ajouter un service au panier ( BBD et state )
  async function addToCard(sellerID, item, quantity) {
    // Checkons si ce service est deja present dans la liste de cette event
    const newEvent = { ...event };

    const refCurrentService = refEvents.doc(event.id).collection("services");

    const doc = await refCurrentService
      .where("id", "==", item.id)
      .where("variation", "==", item.variation)
      .get();
    const refService = doc.exists && doc.data();

    // Si le service existe dans les service séléctionnés pour cet event, on actualise juste en renseignant la nouvelle quantity ( BBD et state )
    if (doc.docs.length > 0) {
      await refCurrentService
        .doc(doc.docs[0].id)
        .update({ quantity: quantity });
      //Ici on chope le service concerné dans le state, puis on le modifie pour ajouter la quantity, et on actualise le state
      const services = [...event.choosedServices];
      const service = services.find(
        (service) =>
          service.variation === item.variation && service.id === item.id
      );
      service.quantity = quantity;
      newEvent.choosedServices = services;
      getChoosedServices(newEvent);
      setLoadingButtonAddToCard(false);
    }
    // Mais si le service n'existe pas, on l'ajoute completement ( BBD et state )
    else {
      const itemCopy = { ...item };
      itemCopy.quantity = quantity;
      const newService = [];
      await refCurrentService.add(itemCopy);
      newService.push(item);
      newEvent.choosedServices.push(newService[0]);
      getChoosedServices(newEvent);
      setLoadingButtonAddToCard(false);
    }
    setIsCardWidgetOpen(true);
  }

  function getServiceQuantityInCard(id) {
    const services = [...event.choosedServices];
    const servicefiltered = services.filter((service) => service.id === id);
    let count = 0;
    if (servicefiltered.length > 1)
      servicefiltered.forEach((service) => (count += service.quantity));
    else if (servicefiltered.length > 0) count += servicefiltered[0].quantity;
    return count;
  }

  async function updateQuantityService(serviceID, quantity) {
    if (quantity === undefined) return;
    quantity = parseInt(quantity);

    if (quantity !== 0) {
      await refEvents
        .doc(event.id)
        .collection("services")
        .doc(serviceID)
        .update({ quantity: quantity });
    } else {
      await refEvents
        .doc(event.id)
        .collection("services")
        .doc(serviceID)
        .delete();
    }

    const eventData = await getEvent(auth.currentUser.uid);
    await getChoosedServices(eventData);
    setLoading(false);
    return;
  }

  function formatLabelTimePicker(secs) {
    if (secs === 86400) secs = 86360;
    var minutes = Math.floor(secs / 60);
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return `${hours}:${("0" + minutes).slice(-2)}`;
  }

  async function getAuthUserFromHisEmail(email) {
    return auth
      .sendPasswordResetEmail(email)
      .then(() => {
        return true;
      })
      .catch(function (error) {
        if (error.code === "auth/invalid-email") {
          return "invalid";
        } else if (error.code === "auth/user-not-found") {
          return "notexist";
        }
      });
  }

  async function updateUserEmail(email) {
    var user = auth.currentUser;
    await user.updateEmail(email);
    await refUsers.doc(user.uid).update({ email: email });
    await user.sendEmailVerification();
    return true;
  }

  async function getCurrentUserProfil() {
    var uid = auth.currentUser.uid;
    const doc = await refUsers.doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  async function updateCurrentUserProfil(data) {
    var uid = auth.currentUser.uid;
    refUsers.doc(uid).update(data);
    user.updateProfile({
      displayName: data.firstName,
    });
  }

  async function setImageSellerDB(url, token) {
    await refSellers.doc(auth.currentUser.uid).update({
      image_path: { url: url, token: token },
    });
  }

  async function addSellerDescription(data, imgURL) {
    await refSellers.doc(auth.currentUser.uid).update({
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
    });
    setSeller({
      ...seller,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      image_path: imgURL !== null && imgURL,
    });
  }

  async function addSellerServices(services) {
    setSeller({ ...seller, services: services });
    services.forEach(async (service) => {
      if (service.id.length > 2) {
        return await refSellers
          .doc(auth.currentUser.uid)
          .collection("services")
          .doc(service.id)
          .update(service);
      }
      return await refSellers
        .doc(auth.currentUser.uid)
        .collection("services")
        .add(service);
    });
  }

  async function addOneSellerService(service) {
    if (service.id.length > 2) {
      return await refSellers
        .doc(auth.currentUser.uid)
        .collection("services")
        .doc(service.id)
        .update(service);
    }
    const docRef = await refSellers
      .doc(auth.currentUser.uid)
      .collection("services")
      .add(service);
    return docRef.id;
  }

  async function getServicesOfCurrentSellerFromDB() {
    const services = await refSellers
      .doc(auth.currentUser.uid)
      .collection("services")
      .get();
    var result = [];
    services.docs.forEach((doc) => {
      const newResult = { ...doc.data(), id: doc.id };
      result.push(newResult);
    });
    return result;
  }

  async function addSellerDocuments(documents) {
    return await refSellers.doc(auth.currentUser.uid).update({
      documents: documents,
    });
  }

  async function getSellerDocumentsFromDB() {
    const query = await refSellers.doc(auth.currentUser.uid).get();
    const doc = query.data();
    const result = doc.documents && doc.documents;
    if (result === undefined) return null;
    return result;
  }

  async function setSellerStatus(sellerId, status) {
    await refSellers.doc(sellerId).update({
      status: status,
    });
    return setSeller({ ...seller, status: status });
  }

  async function updateSellerDocumentsStatus(sellerId, newDocumentsArray) {
    await refSellers.doc(sellerId).update({
      documents: newDocumentsArray,
    });

    newDocumentsArray.status === "rejected" &&
      (await refSellers.doc(sellerId).update({
        status: "subscribing",
      }));
  }

  async function getSellersInDbWithUids(ids) {
    let sellers = [];
    for (const id in ids) {
      const req = await refSellers.doc(ids[id]).get();
      let result = req.data();
      result.uid = req.id;
      sellers = [...sellers, result];
      if (sellers.length === ids.length) {
        return sellers;
      }
    }
  }

  // TODO ICi on a la fonction pour delete la photo de profil qu'on ecrase en a remplaceant, faudra faire la meme avec les autres endroits du site avec uploda de picture
  async function deleteOldSellerPicture(tokens, type) {
    tokens.forEach((token) => {
      var imageRef =
        type && type === "services"
          ? storage.ref("services").child(token)
          : storage.ref("sellers").child(token);
      imageRef.delete().catch((error) => console.log(error));
    });
  }

  async function addSalesInDB(sales) {
    return sales.map(async (sale) => await refSales.add(sale));
  }

  async function getSalesOfEventIdFromDB(eventId) {
    const req = await refSales.where("eventID", "==", eventId).get();
    let salesOfEvent = [];
    req.forEach((doc) => salesOfEvent.push(doc.data()));
    return salesOfEvent;
  }

  async function getSalesOfSellerIdFromDB(sellerId) {
    const req = await refSales.where("sellerID", "==", sellerId).get();
    let salesOfSeller = [];
    req.forEach((doc) => salesOfSeller.push(doc.data()));
    return salesOfSeller;
  }

  async function updateEventStatus(status) {
    await refEvents.doc(event.id).update({ status: status });
    return setEvent({ ...event, status: status });
  }

  async function clearEvent() {
    setEvent(initialEvent);
  }

  async function getEventOfSaleFromDB(eventId) {
    const req = await refEvents.doc(eventId).get();
    let newEvent = req.data();
    newEvent.choosedServices = [];

    const reqServices = await refEvents
      .doc(eventId)
      .collection("services")
      .get();
    reqServices.forEach((doc) => {
      newEvent.choosedServices = [...newEvent.choosedServices, doc.data()];
    });
    return newEvent;
  }

  function formateToDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${day}/${month < 10 ? "0" : ""}${month}/${year}`;
  }

  function formateToDateWithWords(timestamp) {
    const date = new Date(
      timestamp.seconds ? timestamp.seconds * 1000 : timestamp
    );
    const year = date.getUTCFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
    month =
      month === 1
        ? "janv"
        : month === 2
        ? "févr"
        : month === 3
        ? "mars"
        : month === 4
        ? "avril"
        : month === 5
        ? "mai"
        : month === 6
        ? "juin"
        : month === 7
        ? "juil"
        : month === 8
        ? "aout"
        : month === 9
        ? "sept"
        : month === 10
        ? "oct"
        : month === 11
        ? "nov"
        : month === 12 && "déc";
    return `${day} ${month} ${year}`;
  }

  function formateToDateWithFullWords(timestamp) {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
    month =
      month === 1
        ? "janvier"
        : month === 2
        ? "février"
        : month === 3
        ? "mars"
        : month === 4
        ? "avril"
        : month === 5
        ? "mai"
        : month === 6
        ? "juin"
        : month === 7
        ? "juillet"
        : month === 8
        ? "aout"
        : month === 9
        ? "septembre"
        : month === 10
        ? "octobre"
        : month === 11
        ? "novembre"
        : month === 12 && "décembre";
    return `${day} ${month} ${year}`;
  }

  async function updateSaleStatusInDB(saleID, sellerID, status) {
    const req = await refSales
      .where("sellerID", "==", sellerID)
      .where("id", "==", saleID)
      .get();
    let saleUID;
    let userID;
    let sale;
    req.forEach((doc) => {
      sale = doc.data();
      saleUID = doc.id;
      userID = sale.userID;
    });
    const req2 = await refUsers.doc(userID).get();
    const user = req2.data();
    await refSales.doc(saleUID).update({ status });
    sendInBlue_sendNotificationToUserOfSaleStatus(
      user,
      seller.companyName,
      sale
    );
  }

  async function updateSaleNote(saleID, note) {
    const req = await refSales
      .where("sellerID", "==", auth.currentUser.uid)
      .where("id", "==", saleID)
      .get();
    let saleUID;
    req.forEach((doc) => (saleUID = doc.id));
    await refSales.doc(saleUID).update({ note });
    return;
  }

  function dateTodayMinusByDay(day) {
    const date = new Date();
    date.setHours(date.getHours() - 24 * day);
    return date;
  }

  async function addViewsOfSeller(sellerID) {
    const visitorIP = await publicIp.v4();
    const reqViews = await refSellers.doc(sellerID).collection("views").get();

    let recentViews = [];

    reqViews.forEach(async (doc) => {
      const view = doc.data();
      if (
        view.ip === visitorIP &&
        view.date.seconds * 1000 > dateTodayMinusByDay(1)
      ) {
        recentViews = [...recentViews, view];
      }
    });
    if (recentViews.length === 0) {
      await refSellers
        .doc(sellerID)
        .collection("views")
        .add({
          date: new Date(Date.now()),
          ip: visitorIP,
        });
    }
  }

  async function getViewsOfSeller(sellerID) {
    const reqViews = await refSellers.doc(sellerID).collection("views").get();
    let res = [];
    reqViews.forEach((doc) => res.push(doc.data()));
    return res;
  }

  async function isSellerAllowedToModifyAndDeleteService(serviceID) {
    const req = await refSales
      .where("sellerID", "==", auth.currentUser.uid)
      .get();
    let sellerSales = [];
    req.forEach((doc) => sellerSales.push(doc.data()));

    let isAllowed = true;
    sellerSales.forEach((sale) => {
      if (sale.status !== "passed" && sale.status !== "rejected") {
        sale.choosedServices.forEach((service) => {
          if (service.id === serviceID) isAllowed = false;
        });
      }
    });
    return isAllowed;
  }

  async function deleteServiceOfSeller(serviceID) {
    return await refSellers
      .doc(auth.currentUser.uid)
      .collection("services")
      .doc(serviceID)
      .delete();
  }

  async function updateSellerProfil(data) {
    await auth.currentUser.updateProfile({
      displayName: data.firstName,
    });
    await refSellers.doc(auth.currentUser.uid).update({
      companyName: data.companyName,
      website: data.website,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });
    return setSeller({
      ...seller,
      companyName: data.companyName,
      website: data.website,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });
  }

  async function getSellerReferralCountFromDB() {
    const res = await refSellers
      .doc(auth.currentUser.uid)
      .collection("referral")
      .get();
    let newArray = [];
    res.forEach((doc) => newArray.push(doc.data()));

    let finalArray = [];
    for (const item of newArray) {
      const req = await refSellers.doc(item.newSeller).get();
      const res = req.data();
      if (res.status === "opened") finalArray = [...finalArray, res];
    }
    return finalArray.length;
  }

  async function getEventFromUid(uid) {
    const req = await refEvents.doc(uid).get();
    return req.data();
  }

  async function getReviewsOfSellerUid(uid) {
    const req = await refSellers.doc(uid).collection("reviews").get();
    let reviews = [];
    req.forEach((doc) => reviews.push(doc.data()));
    return reviews;
  }

  async function addReviewOfSellerUid(sellerUID, eventID, note, comment, name) {
    return await refSellers
      .doc(sellerUID)
      .collection("reviews")
      .add({
        eventID: eventID,
        note: note,
        comment: comment,
        name: name,
        date: new Date(),
        eventDate: event.date,
      })
      .then((res) => {
        setTotalNoteOfSeller(sellerUID);
        return true;
      })
      .catch((error) => console.log(error));
  }

  async function setTotalNoteOfSeller(sellerUID) {
    const reqReviews = await refSellers
      .doc(sellerUID)
      .collection("reviews")
      .get();
    const reviewsCount = reqReviews.docs.length;
    let totalNote = 0;
    reqReviews.forEach((doc) => {
      const data = doc.data();
      totalNote += data.note;
    });
    let sellerNote = totalNote / reviewsCount;
    sellerNote = sellerNote.toFixed();
    await refSellers.doc(sellerUID).update({
      note: sellerNote,
    });
    return true;
  }

  async function getSellerPosition(sellerUID) {
    const reqSellers = await refSellers.get();
    let sellersWithNote = [];
    reqSellers.forEach((doc) => {
      const data = doc.data();
      if (data.note === undefined) return;
      const seller = { note: data.note, id: doc.id };
      sellersWithNote.push(seller);
    });

    sellersWithNote.sort((a, b) => {
      if (a.note > b.note) return -1;
      if (a.note < b.note) return 1;
      return 0;
    });
    const index = sellersWithNote.findIndex((item) => item.id === sellerUID);
    return index + 1;
  }

  async function getSellersCount() {
    const req = await refSellers.get();
    return req.docs.length;
  }

  async function sendInBlue_addContactSubscribe(
    email,
    firstName,
    lastName,
    uid
  ) {
    createContact = {
      email: email,
      listIds: [4],
      attributes: {
        PRENOM: firstName,
        NOM: lastName && lastName,
        UID: uid ? uid : 0,
      },
    };

    apiInstance.createContact(createContact).then(
      function (data) {
        console.log("API called successfully.");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  async function sendInBlue_sendRecapToUserAfterPayment(email, sales, event) {
    let newSales = [];
    let paid = 0;
    let total = 0;
    sales.forEach((sale) => {
      refSellers
        .doc(sale.sellerID)
        .get()
        .then((doc) => {
          const seller = doc.data();
          const newSale = { ...sale, name: seller.companyName };
          newSales = [...newSales, newSale];

          total = total + sale.total;
          paid = paid + sale.paid;
        });
    });

    sendSmtpEmail = {
      to: [
        {
          email: email,
        },
      ],
      params: {
        sales: newSales,
        event: event,
        paid: paid,
        total: total,
      },
      templateId: 10,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  async function sendInBlue_sendNewSaleToSeller(email, services, event) {
    sendSmtpEmail = {
      to: [
        {
          email: email,
        },
      ],
      params: {
        services: services,
        event: event,
      },
      templateId: 12,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  async function sendInBlue_sendNotificationToSellerOfReview(email, name) {
    sendSmtpEmail = {
      to: [
        {
          email: email,
        },
      ],
      params: {
        name: name,
      },
      templateId: 4,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  async function sendInBlue_sendNotificationToUserOfSaleStatus(
    user,
    prestName,
    sale
  ) {
    sendSmtpEmail = {
      to: [
        {
          email: user.email,
        },
      ],
      params: {
        prestName: prestName,
        userName: user.firstName,
        services: sale.choosedServices,
      },
      templateId:
        sale.status === "rejected" ? 8 : sale.status === "validated" && 9,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  async function getTotalAmountDueToSeller(sellerId) {
    const req = await refSales
      .where(
        "sellerID",
        "==",
        sellerId !== undefined ? sellerId : auth.currentUser.uid
      )
      .get();
    let salesOfSeller = [];
    req.forEach((doc) => {
      salesOfSeller = [...salesOfSeller, doc.data()];
    });
    const validSales = salesOfSeller.filter(
      (sale) => sale.total === sale.paid && sale.status === "validated"
    ); // à mettre en passed je pense
    const prices = validSales.map((sale) => sale.price);
    let finalAmount = 0;
    prices.forEach((price) => {
      finalAmount = finalAmount + price;
    });
    return finalAmount;
  }

  async function sendInBlue_sendPaymentRequestToAdmin(sellerId) {
    const amount = await getTotalAmountDueToSeller(sellerId);

    sendSmtpEmail = {
      to: [
        {
          email: process.env.REACT_APP_ADMIN_EMAIL,
        },
      ],
      params: {
        sellerId: sellerId,
        amount: amount,
      },
      templateId: 16,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  async function sendInBlue_sendBillRequestToAdmin(transactionID, sellerID) {
    sendSmtpEmail = {
      to: [
        {
          email: process.env.REACT_APP_ADMIN_EMAIL,
        },
      ],
      params: {
        sellerId: sellerID,
        transactionId: transactionID,
      },
      templateId: 17,
      headers: {
        "X-Mailin-custom":
          "Content-Type:application/json|custom_header_2:custom_value_2",
      },
    };

    return apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
        return true;
      },
      function (error) {
        console.error(error);
        return false;
      }
    );
  }

  async function sendInBlue_addContactToNewsletter(email) {
    createContact = {
      email: email,
      listIds: [5],
    };

    return apiInstance.createContact(createContact).then(
      function (data) {
        return true;
      },
      function (error) {
        console.log(error);
        return false;
      }
    );
  }

  async function sendInBlue_sendInvitations(emails, message, user, event) {
    let emailsArray = [];
    let emailsArrayWithList = [];
    emails.forEach((email) => {
      const newEntry = { email: email };
      const newEntryList = {
        email: email,
        listIds: [6],
        attributes: {
          EVENT_DATE: new Date(event.date),
        },
      };
      emailsArray = [...emailsArray, newEntry];
      emailsArrayWithList = [...emailsArrayWithList, newEntryList];
    });

    const eventDate = formateToDateWithFullWords(event.date);
    const startAt = formatLabelTimePicker(event.startAt);
    const endAt = formatLabelTimePicker(event.endAt);
    const creneaux = startAt + " et " + endAt;

    sendSmtpEmail = {
      to: emailsArray,
      params: {
        prenom: user.displayName,
        message: message,
        nomEvent: event.name,
        adresse: event.place,
        invites: event.people,
        date: eventDate,
        creneaux: creneaux,
      },
      templateId: 7,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    return apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        return true;
      },
      function (error) {
        return false;
      }
    );
  }

  async function getWishList(userID) {
    const req = await refUsers.doc(userID).get();
    const res = req.data();
    return res.wishlist || [];
  }

  async function deleteItemFromWishList(sellerID) {
    let newWishList = await getWishList(auth.currentUser.uid);
    newWishList = newWishList.filter((item) => item !== sellerID);
    await refUsers.doc(auth.currentUser.uid).update({
      wishlist: newWishList,
    });
    return newWishList;
  }

  async function addItemToWishListOfUser(sellerID) {
    let newWishList = await getWishList(auth.currentUser.uid);
    newWishList = [...newWishList, sellerID];
    refUsers.doc(auth.currentUser.uid).update({
      wishlist: newWishList,
    });
    return;
  }

  async function getWishListCountOfSeller(sellerID) {
    const users = await refUsers
      .where("wishlist", "array-contains", sellerID)
      .get();
    return users.docs.length;
  }

  async function isSellerInWishListOfUser(id) {
    const currentWishList = await getWishList(auth.currentUser.uid);
    const isSellerInList = currentWishList.filter((item) => item === id);

    return isSellerInList.length > 0 ? true : false;
  }

  async function getEmailOfSellerWithUid(sellerID) {
    const query = await refSellers.doc(sellerID).get();
    const result = query.data();
    return result.email;
  }

  async function sendInBlue_sendToParrainAboutNewReferral(referralCode) {
    // Aller choper en bdd le seller correspondant au referral code
    const query = await refSellers
      .where("referralToken", "==", referralCode)
      .get();
    const result = query[0].data();
    const email = result.email;

    // Puis envoyer à ce seller le mail de new referral
    sendSmtpEmail = {
      to: [
        {
          email: email,
        },
      ],
      params: {
        name: "a",
      },
      templateId: 14,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstanceSend.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: ");
      },
      function (error) {
        console.error(error);
      }
    );
  }

  function checkoutStart(price) {
    const saleToken =
      Date.now().toString().substr(0, 9) +
      Math.random().toString().substr(2, 9);
    refEvents.doc(event.id).update({
      saleToken: saleToken,
    });
    createStripeCheckout({
      price: price,
      eventId: event.id,
      saleToken: saleToken,
    })
      .then((response) => {
        const sessionId = response.data.id;
        stripe.redirectToCheckout({ sessionId: sessionId });
      })
      .catch((error) => console.log(error));
  }

  function checkoutSubscription() {
    const saleToken =
      Date.now().toString().substr(0, 9) +
      Math.random().toString().substr(2, 9);
    refSellers.doc(seller.uid).update({
      saleToken: saleToken,
    });
    createStripeSubscribe({
      sellerID: seller.uid,
      saleToken: saleToken,
    })
      .then((response) => {
        const sessionId = response.data.id;
        stripe.redirectToCheckout({ sessionId: sessionId });
      })
      .catch((error) => console.log(error));
  }

  async function getSaleTokenOfEventFromDb() {
    const req = await refEvents.doc(event.id).get();
    const res = req.data();
    return res.saleToken;
  }

  async function checkoutCheck(session_id) {
    return checkStripeReturn({ session_id: session_id }).then((result) => {
      return {
        status: result.data.payment_status,
        amount: result.data.amount_total,
        id: result.data.payment_intent || result.data.subscription,
      };
    });
  }

  async function addFoodTypeToSeller(type) {
    if (type === "Aucun") return;
    let newSeller = { ...seller };
    let newFoodTypes = [];
    if (seller.foodTypes === undefined) {
      newFoodTypes.push(type);
    } else {
      newFoodTypes = seller.foodTypes;
      newFoodTypes.push(type);
    }
    newSeller["foodTypes"] = newFoodTypes;
    await refSellers.doc(auth.currentUser.uid).update({
      foodTypes: newFoodTypes,
    });
    setSeller(newSeller);
  }

  async function deleteFoodTypeToSeller(serviceID) {
    const req = await refSellers
      .doc(auth.currentUser.uid)
      .collection("services")
      .doc(serviceID)
      .get();
    const data = req.data();
    const type = data.foodType;

    if (type === "Aucun") return;
    let newSeller = { ...seller };
    let newFoodTypes = [];
    if (seller.foodTypes === undefined) return;
    else {
      newFoodTypes = seller.foodTypes;
      let indexes = seller.foodTypes
        .map((item, index) => (item === type ? index : ""))
        .filter(String);
      if (indexes[0] === -1) return;
      else if (newFoodTypes.length > 1) {
        newFoodTypes.splice(indexes[0], 1);
      } else newFoodTypes = [];

      newSeller["foodTypes"] = newFoodTypes;
      await refSellers.doc(auth.currentUser.uid).update({
        foodTypes: newFoodTypes,
      });
      setSeller(newSeller);
    }
  }
  return (
    <UserContext.Provider
      value={{
        login,
        subscribe,
        sellerSubscribe,
        saveHoliday,
        logout,
        user,
        seller,
        event,
        setUser,
        setSeller,
        addEvent,
        addToCard,
        getServiceQuantityInCard,
        loadingButtonAddToCard,
        setLoadingButtonAddToCard,
        setCurrentStepProcess,
        currentStepProcess,
        formatLabelTimePicker,
        getAuthUserFromHisEmail,
        updateUserEmail,
        updateQuantityService,
        signInWithGoogle,
        getCurrentUserProfil,
        verifyLogin,
        updateCurrentUserProfil,
        addSellerDescription,
        setImageSellerDB,
        addSellerServices,
        addOneSellerService,
        getServicesOfCurrentSellerFromDB,
        addSellerDocuments,
        getSellerDocumentsFromDB,
        setSellerStatus,
        updateSellerDocumentsStatus,
        getSellersInDbWithUids,
        deleteOldSellerPicture,
        addSalesInDB,
        updateEventStatus,
        getSalesOfEventIdFromDB,
        clearEvent,
        getSalesOfSellerIdFromDB,
        getEventOfSaleFromDB,
        formateToDate,
        formateToDateWithWords,
        updateSaleStatusInDB,
        updateSaleNote,
        addViewsOfSeller,
        getViewsOfSeller,
        isSellerAllowedToModifyAndDeleteService,
        deleteServiceOfSeller,
        updateSellerProfil,
        getSellerReferralCountFromDB,
        getEventFromUid,
        getReviewsOfSellerUid,
        addReviewOfSellerUid,
        sendInBlue_sendNotificationToSellerOfReview,
        sendInBlue_addContactToNewsletter,
        sendInBlue_sendInvitations,
        sendInBlue_sendRecapToUserAfterPayment,
        sendInBlue_sendNewSaleToSeller,
        sendInBlue_sendToParrainAboutNewReferral,
        sendInBlue_sendPaymentRequestToAdmin,
        getWishList,
        deleteItemFromWishList,
        addItemToWishListOfUser,
        isSellerInWishListOfUser,
        getEmailOfSellerWithUid,
        checkoutStart,
        getSaleTokenOfEventFromDb,
        checkoutCheck,
        getTotalAmountDueToSeller,
        homeSellersDisplay,
        setHomeSellersDisplay,
        getWishListCountOfSeller,
        getSellerPosition,
        getSellersCount,
        sendInBlue_sendBillRequestToAdmin,
        addFoodTypeToSeller,
        deleteFoodTypeToSeller,
        isCardWidgetOpen,
        setIsCardWidgetOpen,
        checkoutSubscription,
        refSellers,
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};
