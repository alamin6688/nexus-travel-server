const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrlryfn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection = client.db("nexusTravel").collection("users");
    const touristSpotCollection = client
      .db("nexusTravel")
      .collection("addTouristSpot");
    const myListCollection = client.db("nexusTravel").collection("myList");

    // Post a User To DB
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "User already exist",
        });
      }
      if (!existingUser) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
    });

    // Post a Tourist Spot To DB
    app.post("/addTouristSpot", async (req, res) => {
      const addInfo = req.body;
      const result = await touristSpotCollection.insertOne(addInfo);
      res.send(result);
      console.log(result);
    });

    // Get All Tourists Spot Data From DB
    app.get("/allTouristSpot", async (req, res) => {
      const result = await touristSpotCollection.find().toArray();
      res.send(result);
    });

    // Get Tourist Spot Details by ID
    app.get("/allTouristSpot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.findOne(query);
      res.send(result);
    });

    // Post User Added List Data to DB
    app.post("/myList", async (req, res) => {
      const myList = req.body;
      const query = { loggedUser: myList.loggedUser, cartId: myList.cartId };
      const existingItem = await myListCollection.findOne(query);
      if (existingItem) {
        return res
          .status(400)
          .send({ message: "This tourist spot is already in your list!" });
      }
      const result = await myListCollection.insertOne(myList);
      res.send(result);
    });

    // Get User's Added List Data from DB
    app.get("/myList", async (req, res) => {
      const userEmail = req.query.email;
      const query = { loggedUser: userEmail };
      const result = await myListCollection.find(query).toArray();
      res.send(result);
    });

    // Delete a Tourist Spot From My List
    app.delete("/myList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await myListCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send(result);
      } else {
        res.status(404).send({ error: "Tourist spot not found" });
      }
    });

    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("Nexus is running");
});

app.listen(port, () => {
  console.log(`Nexus Travel server is running on port: ${port}`);
});
