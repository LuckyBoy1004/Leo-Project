const functions = require("firebase-functions");

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const dateInXDays = (day) => {
  const date = new Date();
  date.setHours(date.getHours() + (24 * day));
  return date;
};

const refSales = db.collection("sales");
const refEvents = db.collection("events");

// Mise en place de l'expiration d'une commande
exports.saleDelayLimitValidated = functions.pubsub
    .schedule("every 300 minutes")
    .onRun((context) => {
      refSales.where("status", "==", "pending").get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              const sale = doc.data();
              if (sale.eventDate !== undefined) {
                const eventDate = sale.eventDate.seconds * 1000;
                if (eventDate < dateInXDays(10)) {
                  console.log(doc.id, "=>", "ici on passe la sale à rejected");
                  refSales.doc(doc.id).update({status: "rejected"});
                }
              }
            });
          });
      return null;
    });

exports.setEventToPassed = functions.pubsub
    .schedule("every 300 minutes")
    .onRun((context) => {
      refEvents.where("status", "==", "validated").get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              const event = doc.data();
              if (event.date !== undefined) {
                const eventDate = event.date.seconds * 1000;
                if (new Date() > eventDate) {
                  refEvents.doc(doc.id).update({status: "passed"});
                  console.log(doc.id, "=>", "on a passé le status à passed");
                }
              }
            });
          });
      return null;
    });

// Ne pas oublier de définir la clé secrete dans le terminal,
// avant de publier sur le nouveau firebase
exports.createStripeCheckout = functions.https
    .onCall(async (data, context) => {
      const stripe = require("stripe")(functions.config().stripe.secret_key);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `https://nivid.fr/creer-mon-evenement/etape-3/confirmation?id=${data.eventId}&token=${data.saleToken}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: "https://nivid.fr/",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: (data.price) * 100,
              product_data: {
                name: "Commande Nivid",
              },
            },
          },
        ],
      });
      return {
        id: session.id,
      };
    });

exports.checkStripeReturn = functions.https
    .onCall(async (data, context) => {
      const stripe = require("stripe")(functions.config().stripe.secret_key);
      const session = await stripe.checkout.sessions.retrieve(data.session_id);
      return session;
    });

exports.createStripeSubscribe = functions.https
    .onCall(async (data, context) => {
      const stripe = require("stripe")(functions.config().stripe.secret_key);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        success_url: `https://nivid.fr/mon-compte-partenaire/process/description?id=${data.sellerID}&token=${data.saleToken}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: "https://nivid.fr/",
        line_items: [
          {price: "price_1KC3lpBwyEuW61PjLN7gVJ2n", quantity: 1},
        ],
      });
      return {
        id: session.id,
      };
    });
