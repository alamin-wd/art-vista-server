const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//  Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygq6chl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let craftItemCollection;
let userCollection;

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        craftItemCollection = client.db('craftItemDB').collection('craftItem');
        userCollection = client.db('craftItemDB').collection('user');


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

// Add(Create) Craft Item 
app.post('/craftItem', async (req, res) => {
    const newCraftItem = req.body;
    console.log(newCraftItem);

    try {
        const result = await craftItemCollection.insertOne(newCraftItem);
        res.send(result);
    } catch (error) {
        console.error('Error Inserting Craft Item, error');
        res.json({ error: 'Failed to Add Craft Item' });
    }
})

// Get(Read) Craft Items
app.get('/craftItems', async (req, res) => {

    const cursor = craftItemCollection.find();
    const result = await cursor.toArray();

    res.send(result);
})

// Get Single Craft Item
app.get('/craftItem/:id', async (req, res) => {

    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await craftItemCollection.findOne(query);

    res.send(result);
})

// GET craft items by user email
app.get('/craftItems/user/:userEmail', async (req, res) => {
    const userEmail = req.params.userEmail;
    const query = { userEmail }; 

    try {
        const cursor = await craftItemCollection.find(query);
        const result = await cursor.toArray();
        res.json(result); 
    } catch (error) {
        console.error('Error fetching craft items:', error);
        res.status(500).json({ error: 'Failed to fetch craft items' });
    }
});


// Update Craft Items
app.put('/craftItem/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };

    const updatedCraftItem = req.body;

    const craftItem = {

        $set: {
            craftItemName: updatedCraftItem.craftItemName,
            sub_categoryName: updatedCraftItem.sub_categoryName,
            price: updatedCraftItem.price,
            rating: updatedCraftItem.rating,
            processingTime: updatedCraftItem.processingTime,
            customization: updatedCraftItem.customization,
            stockStatus: updatedCraftItem.stockStatus,
            imageURL: updatedCraftItem.imageURL,
            shortDescription: updatedCraftItem.shortDescription
        }

    }

    const result = await craftItemCollection.updateOne(filter, craftItem, options);
    res.send(result);
})

// Delete Craft Items
// app.delete('/craftItem/:id', async (req, res) => {

//     const id = req.params.id;
//     const query = { _id: new ObjectId(id) };
//     const result = await craftItemCollection.deleteOne(query);

//     res.send(result);
// })


//  User Related API's

// Add(Create) User
app.post('/user', async (req, res) => {
    const user = req.body;
    console.log(user);

    const result = await userCollection.insertOne(user);
    res.send(result);
})

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Art Vista server is running.')
})


app.listen(port, () => {
    console.log(`Art Vista server is running on port: ${port}`)
})

