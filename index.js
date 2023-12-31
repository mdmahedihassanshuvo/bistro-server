const express = require("express");
const app = express();
var jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 7000;

// middle wares.............................
app.use(express.json());
app.use(cors());

// const verifyJwt = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res
//       .status(401)
//       .send({ error: true, message: "Unauthorized access" });
//   }

//   const token = authorization.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
//     if (err) {
//       return res
//         .status(403)
//         .send({ error: true, message: "Unauthorized access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };

// CRUD Operation...........................

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwgviar.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // CRUD OPERATION...........................

    const menuCollection = client.db("bistro").collection("menu");
    const reviewCollection = client.db("bistro").collection("reviews");
    const userCollection = client.db("bistro").collection("users");
    const cartCollection = client.db("bistro").collection("cartItem");
    const bookingCollection = client.db("bistro").collection("bookings");
    const paymentCollection = client.db("bistro").collection("payments");

    // app.post("/jwt", (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    //     expiresIn: "1h",
    //   });
    //   const result = { token };
    //   res.send(result);
    // });

    app.post("/menu", async (req, res) => {
      const item = req.body;
      const result = await menuCollection.insertOne(item);
      // console.log(result);
      res.send(result);
    });

    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    app.delete("/menu/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await menuCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/menu/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const item = req.body;
      const updateItem = {
        $set: {
          name: item?.name,
          category: item?.category,
          price: item?.price,
          recipe: item?.recipe,
        },
      };
      const result = await menuCollection.updateOne(filter, updateItem);
      console.log(result);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const axistUser = await userCollection.findOne(query);
      if (axistUser) {
        return { message: "user all ready exist" };
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };

      const user = await userCollection.findOne(query);
      const result = { admin: user?.roll === "admin" };
      res.send(result);
    });

    app.patch("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const user = req.body;
      const updateUser = {
        $set: {
          roll: user.roll,
        },
      };
      const result = await userCollection.updateOne(filter, updateUser);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const cartItemId = req.params.id;
      // console.log(typeof(cartItemId));
      const result = await cartCollection.deleteOne({ id: cartItemId });
      res.send(result);
    });

    // payment intent.........................

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      console.log(price, amount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    app.get("/booking/:email", async (req, res) => {
      const email = req.params.email;
      const query = { user: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const booking = req.body;
      const updateBooking = {
        $set: {
          activity: booking.activity,
        },
      };
      const result = await bookingCollection.updateOne(filter, updateBooking);
      res.send(result);
    });

    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/payment", async (req, res) => {
      const payment = req.body;
      const InsertResult = await paymentCollection.insertOne(payment);
      const query = {
        id: { $in: payment.CartItems.map((id) => id) },
      };
      // console.log(query);

      const deleteResult = await cartCollection.deleteMany(query);
      // console.log(deleteResult);

      res.send({ InsertResult, deleteResult });
    });

    app.get("/payment", async (req, res) => {
      const result = await paymentCollection.find().toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/payment/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`The bistro server is running at ${port}`);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
