const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//  //todo must delete this
// const uri = "mongodb://127.0.0.1:27017/";
// const uri =
//   "mongodb+srv://assignmentDatabase:FkKtQ8HmssmVDvJj@cluster0.33bueao.mongodb.net/?retryWrites=true&w=majority";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.33bueao.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();

    const toysCollection = client.db("toysDB").collection("toys");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await toysCollection.insertOne(newToys);
      res.send(result);
    });

    //getting specific user item
    app.get("/toysSeller", async (req, res) => {
      console.log(req.query.sellerEmail);
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // delete items from database
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);

      res.send(result);
    });

    // update the toys data
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const toysInfo = req.body;
      console.log(toysInfo);
      const filter = { _id: new ObjectId(id) };
      const options = {
        upsert: true,
      };
      const updatedUser = {
        $set: {
          price: toysInfo.price,
          quantity: toysInfo.quantity,
          description: toysInfo.description,
        },
      };

      const result = await toysCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.send(result);
    });

    // app.get("/toys/:id", async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);

    //   const query = { _id: new ObjectId(id) };
    //   const result = await toysCollection.findOne(query);
    //   res.send(result);
    // });

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
  res.send("running user information");
});

app.listen(port, () => {
  console.log(`MongoDB is running on port: ${port}`);
});
