const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.caldhyv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client.db('carPaintingWorkshop').collection('services');
    const bookingCollection = client.db('carPaintingWorkshop').collection('bookings');

    // get all data
    app.get('/services', async(req, res)=>{
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    // load single data

    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const options = {
       projection: { title: 1, price : 1, service_id : 1, img:1 },
      };
      console.log(options);
      const result = await servicesCollection.findOne(query, options);
      res.send(result);
    });

    // load some data (user specific)

   app.get('/bookings', async(req, res)=>{
    let query = {};
    if(req.query?.email){
      query = {email : req.query.email}
    }
    const result = await bookingCollection.find(query).toArray();
    res.send(result);
   })

    // post api
    app.post('/bookings', async(req, res)=>{
      const booking = req.body;
      console.log(booking)
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // update api
    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc = {
      $set: {
       status : updateBooking.status
      },
    };
    const result = await bookingCollection.updateOne(filter, updateDoc);
    res.send(result);
    })
    
    // delete api

    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server to confirmation

app.get('/', async(req, res)=>{
    res.send('car painting server is running');
});

app.listen(port,()=>{
    console.log(`car painting server is running on port : ${port}`)
})