const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://localhost:5173",
      "https://nexus-travel-client.web.app",
      "https://nexus-travel-client.firebaseapp.com",
      "https://elegant-concha-76b0a5.netlify.app",
    ],
  })
);
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
    const myListCollection = client.db("nexusTravel").collection("myList");

    // Post a User To DB
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "User already exist!",
        });
      }
      if (!existingUser) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
    });

    // Get ALL Users From DB
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // Get Tourist Spot Details by ID
    app.get("/allTouristSpot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myListCollection.findOne(query);
      res.send(result);
    });

    // Post addInfo in My List Page
    app.post("/allTouristSpot", async (req, res) => {
      const addInfo = req.body;
      const result = await myListCollection.insertOne(addInfo);
      res.send(result);
      console.log(result);
    });

    // Get addInfo in My List Page
    app.get("/allTouristSpot", async (req, res) => {
      const result = await myListCollection.find().toArray();
      res.send(result);
    });

    // Update a Tourist Spot From My List Page
    app.put("/allTouristSpot/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInfo = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updatedInfo,
      };
      const result = await myListCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete a Tourist Spot From My List Page
    app.delete("/allTouristSpot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myListCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send(result);
      } else {
        res.status(404).send({ error: "Tourist spot not found!" });
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
