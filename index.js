const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

// ${process.env.DB_USER}
// ${process.env.DB_PASS}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mp1yd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // work
    const usersCalection = client.db("educationManege").collection("users");
    const allClassCalection = client
      .db("educationManege")
      .collection("allClass");
    const allAssignmentCalection = client
      .db("educationManege")
      .collection("allAssignment");
    const addTeacherCalection = client
      .db("educationManege")
      .collection("addteach");
    const paymentCalection = client
      .db("educationManege")
      .collection("payment-user");
    const ratingCalection = client
      .db("educationManege")
      .collection("users-rating");
    const problemsCalection = client
      .db("educationManege")
      .collection("problems");

    // get total user enroll class
    app.get("/total/users/class/enroll", async (req, res) => {
      const queryClass = { status: "approves" };
      const users = await usersCalection.find().toArray();
      const classes = await allClassCalection.find(queryClass).toArray();
      res.send({ users: users, classes: classes });
    });
    // get free class
    app.get("/free/classes", async (req, res) => {
      const query = {
        status: "pogress",
      };
      const result = await allClassCalection.find(query).toArray();
      res.send(result);
    });
    // get feedback in user
    app.get("/rating", async (req, res) => {
      const result = await ratingCalection.find().toArray();
      res.send(result);
    });
    // post all rating / feedback for user
    app.post("/rating/user", async (req, res) => {
      const data = req.body;
      const result = await ratingCalection.insertOne(data);
      // console.log(result);
      res.send(result);
    });
    // assignment submition count wincriment
    app.patch("/assignment/countincriment/:id", async (req, res) => {
      const id = req.params.id;
      const conutData = req.body;
      const query = { _id: new ObjectId(id) };
      const updatatedCount = {
        $set: {
          submition: conutData?.submition + conutData?.count,
        },
      };
      const result = await allAssignmentCalection.updateOne(
        query,
        updatatedCount
      );
      res.send(result);
    });
    // get email to all assignment
    app.get("/assignment/teather/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allAssignmentCalection.find(query).toArray();
      res.send(result);
    });
    // my payment class
    app.get("/payment/class/:email", async (req, res) => {
      const email = req.params.email;
      const query = { useremail: email };
      const result = await paymentCalection.find(query).toArray();
      res.send(result);
    });
    // payment user post save data
    app.post("/payment", async (req, res) => {
      const data = req.body;
      const result = await paymentCalection.insertOne(data);
      res.send(result);
    });
    // prement to UpDate enroll coount number to all class
    app.patch("/update/class/enroll", async (req, res) => {
      const data = req.body;
      const id = data?.calssId;
      const filter = { _id: new ObjectId(id) };
      const updateOne = {
        $set: {
          enroll: data?.enroll + 1,
        },
      };
      const updateData = await allClassCalection.updateOne(filter, updateOne);
      res.send(updateData);
    });

    // get user role
    app.get("/onteach/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const query = { email: email };
      const result = await usersCalection.findOne(query);
      res.send(result);
    });
    // get user status
    app.get("/onrole/:email", async (req, res) => {
      const email = req.params?.email;
      const query = { email: email };
      const result = await addTeacherCalection.findOne(query);
      res.send(result);
    });
    // get all add teacher calection
    app.get("/addteaches", async (req, res) => {
      const result = await addTeacherCalection.find().toArray();
      res.send(result);
    });
    // all add teacher on post
    app.post("/addteach", async (req, res) => {
      const data = req.body;
      const email = data?.email;
      const filter = { email: email };
      const query = await addTeacherCalection.findOne(filter);
      if (query) {
        return;
      }
      const result = await addTeacherCalection.insertOne(data);
      res.send(result);
    });
    // Add teacher id to addmin approve
    app.patch("/addteach/approve/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const queryOne = { _id: new ObjectId(id) };
      const queryTwo = { email: data?.email };
      const upDateDocOne = {
        $set: {
          status: data?.status,
        },
      };
      const upDateDocTwo = {
        $set: {
          role: data?.role,
        },
      };
      const resultOne = await addTeacherCalection.updateOne(
        queryOne,
        upDateDocOne
      );
      const resultTwo = await usersCalection.updateOne(queryTwo, upDateDocTwo);
      res.send(resultOne);
    });
    // Rejected teacher to Addmin by id
    app.patch("/addteach/reject/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      // console.log("------------", data);
      const query = { _id: new ObjectId(id) };
      const upDateDoc = {
        $set: {
          status: data?.status,
        },
      };
      const result = await addTeacherCalection.updateOne(query, upDateDoc);
      res.send(result);
    });

    // user to teacher request another now
    app.patch("/addteach/renue", async (req, res) => {
      const data = req.body;
      const query = { email: data?.email };
      const upDateDoc = {
        $set: {
          status: "pending",
        },
      };
      const result = await addTeacherCalection.updateOne(query, upDateDoc);
      // console.log("-----------", result);
      res.send(result);
    });
    // post allassignment calection
    app.post("/allassignment", async (req, res) => {
      const data = req.body;
      // console.log(data);
      const result = await allAssignmentCalection.insertOne(data);
      res.send(result);
    });
    // all assignment count
    app.get("/allassignment/count/:email", async (req, res) => {
      const email = req.params;
      const totalassignment = await allAssignmentCalection
        .find(email)
        .toArray();
      res.send(totalassignment);
    });
    // get users calection // and search user bt addmin
    app.get("/users", async (req, res) => {
      const search = req?.query?.search;
      if (search) {
        const filter = { name: { $regex: search, $options: "i" } };
        const results = await usersCalection.find(filter).toArray();
        return res.send(results);
      }
      const users = usersCalection.find();
      const result = await users.toArray();
      res.send(result);
    });
    // users calection post & seve user name,email,role in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const oldUsers = await usersCalection.findOne(query);
      if (oldUsers) {
        return;
      }
      const result = await usersCalection.insertOne(user);
      res.send(result);
    });
    // user has been Addmin by addmin users page
    app.patch("/user/:id", async (req, res) => {
      const userId = req.params?.id;
      const data = req.body?.role;
      const id = { _id: new ObjectId(userId) };
      const upDateDoc = {
        $set: {
          role: data,
        },
      };
      const result = await usersCalection.updateOne(id, upDateDoc);
      res.send(result);
    });
    // users calection find in email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCalection.findOne(query);
      res.send(result);
    });
    // id to All classData calection
    app.get("/allclass/iddataloard/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allClassCalection.findOne(query);
      // console.log(result);
      res.send(result);
    });
    // id to all class data post
    app.patch("/allclass/update/:id", async (req, res) => {
      const data = req?.body;
      const id = data?.id;

      const query = { _id: new ObjectId(id) };
      const upDateDoc = {
        $set: {
          title: data?.title,
          photoUrl: data?.photoUrl,
          price: data?.price,
          bio: data?.bio,
        },
      };
      const result = await allClassCalection.updateOne(query, upDateDoc);
      res.send(result);
    });
    // allclass data pprove,rejected,pogress by id in Addmin
    app.patch("/allclass/approve/:id", async (req, res) => {
      const id = req.params?.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const upDateDoc = {
        $set: {
          status: data?.status,
        },
      };
      const result = await allClassCalection.updateOne(query, upDateDoc);
      // console.log(result);
      res.send(result);
    });
    // email to All classData calection
    app.get("/allclass/useremail", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = { email: email };
      const allClassData = allClassCalection.find(query);
      const result = await allClassData.toArray();
      res.send(result);
    });
    // email to All classData calection
    app.get("/allclass", async (req, res) => {
      const allClassData = allClassCalection.find();
      const result = await allClassData.toArray();
      res.send(result);
    });
    // All class data calection
    app.post("/allclass", async (req, res) => {
      const data = req.body;
      const result = await allClassCalection.insertOne(data);
      res.send(result);
    });
    // delete all class data calection
    app.delete("/allclass/deleteone/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allClassCalection.deleteOne(query);
      res.send(result);
    });

    // users problems
    app.post("/problems", async (req, res) => {
      const data = req.body;
      const result = await problemsCalection.insertOne(data);
      // console.log(result);
      res.send(result);
    });

    // work
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//
app.get("/", (req, res) => {
  res.send("Education Enrolment runing");
});
app.listen(port, () => {
  console.log(`Education is at: ||  ${port}`);
});
