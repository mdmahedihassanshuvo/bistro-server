const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 7000;
require("dotenv").config();

// middle wares.............................
app.use(express.json());
app.use(cors());

// CRUD Operation...........................

const { MongoClient, ServerApiVersion } = require("mongodb");
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
    await client.connect();

    const menuCollection = client.db("bistro").collection("menu");
    const reviewCollection = client.db("bistro").collection("reviews");
    const userCollection = client.db("bistro").collection("users");
    const cartCollection = client.db("bistro").collection("cartItem");

    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
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

    // CRUD OPERATION...........................

    app.post("/cart", async(req, res) =>{
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    app.get("/cart/:email", async(req, res) => {
      const email = req.params.email;
      const query = {userEmail : email};
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    })

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
