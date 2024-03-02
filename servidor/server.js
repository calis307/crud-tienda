

const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

// Cors configuration - Allows requests from localhost:4200
const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
};

// Use cors middleware
app.use(cors(corsOptions));

// Use express.json() middleware to parse JSON bodies of requests
app.use(express.json());

// GET route - Allows to get all the items
// example: localhost:3000/clothes?page=0&perPage=2
app.get("/clothes", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const start = page * perPage;
    const end = start + perPage;

    const result = jsonData.items.slice(start, end);

    res.status(200).json({
      items: result,
      total: jsonData.items.length,
      page,
      perPage,
      totalPages: Math.ceil(jsonData.items.length / perPage),
    });
  });
});

// POST route - Allows to add a new item
// example: localhost:3000/clothes
/*
  body: {
    "image": "https://your-image-url.com/image.png",
    "name": "T-shirt",
    "price": "10",
    "rating": 4
  }
*/
app.post("/clothes", (req, res) => {
  const { image, name, price, rating } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const maxId = jsonData.items.reduce(
      (max, item) => Math.max(max, item.id),
      0
    );

    const newItem = {
      id: maxId + 1,
      image,
      name,
      price,
      rating,
    };

    jsonData.items.push(newItem);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(201).json(newItem);
    });
  });
});

// PUT route - Allows to update an item
// example: localhost:3000/clothes/1
/*
  body: {
    "image": "https://your-image-url.com/image.png",
    "name": "T-shirt",
    "price": "10",
    "rating": 4
  }
*/
app.put("/clothes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { image, name, price, rating } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const index = jsonData.items.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }

    jsonData.items[index] = {
      id,
      image,
      name,
      price,
      rating,
    };

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(200).json(jsonData.items[index]);
    });
  });
});

// DELETE route - Allows to delete an item
// example: localhost:3000/clothes/1
app.delete("/clothes/:id", (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const index = jsonData.items.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }

    jsonData.items.splice(index, 1);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(204).send();
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



// Alternativa 1 MongoDB


/* const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 3000;

// Cors configuration - Allows requests from localhost:4200
const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
};

// Use cors middleware
app.use(cors(corsOptions));

// Use express.json() middleware to parse JSON bodies of requests
app.use(express.json());

const url = "mongodb://localhost:27017";
const dbName = "productos-db";

// Function to connect to MongoDB
async function connectToMongoDB() {
  const client = new MongoClient(url, { useUnifiedTopology: true });
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    throw err;
  }
}

// GET route - Allows to get all the items
app.get("/clothes", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const totalItems = await collection.countDocuments();
    const items = await collection.find().skip(page * perPage).limit(perPage).toArray();

    res.status(200).json({
      items,
      total: totalItems,
      page,
      perPage,
      totalPages: Math.ceil(totalItems / perPage),
    });
  } catch (err) {
    console.error("Error fetching items", err);
    res.status(500).send("Internal Server Error");
  }
});

// POST route - Allows to add a new item
app.post("/clothes", async (req, res) => {
  const { image, name, price, rating } = req.body;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const result = await collection.insertOne({ image, name, price, rating });
    const newItem = result.ops[0];

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item", err);
    res.status(500).send("Internal Server Error");
  }
});

// PUT route - Allows to update an item
app.put("/clothes/:id", async (req, res) => {
  const id = req.params.id;
  const { image, name, price, rating } = req.body;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { image, name, price, rating } },
      { returnOriginal: false }
    );

    const updatedItem = result.value;

    if (!updatedItem) {
      res.status(404).send("Not Found");
      return;
    }

    res.status(200).json(updatedItem);
  } catch (err) {
    console.error("Error updating item", err);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE route - Allows to delete an item
app.delete("/clothes/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const result = await collection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).send("Not Found");
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting item", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
 */


// Alternativa 2 MongoDB


/**
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 3000;

// Cors configuration - Allows requests from localhost:4200
const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
};

// Use cors middleware
app.use(cors(corsOptions));

// Use express.json() middleware to parse JSON bodies of requests
app.use(express.json());

const url = "mongodb://localhost:27017";
const dbName = "productos-db";

// Function to connect to MongoDB
async function connectToMongoDB() {
  const client = new MongoClient(url, { useUnifiedTopology: true });
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    throw err;
  }
}

// GET route - Allows to get all the items
app.get("/clothes", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const totalItems = await collection.countDocuments();
    const items = await collection.find().skip(page * perPage).limit(perPage).toArray();

    res.status(200).json({
      items,
      total: totalItems,
      page,
      perPage,
      totalPages: Math.ceil(totalItems / perPage),
    });
  } catch (err) {
    console.error("Error fetching items", err);
    res.status(500).send("Internal Server Error");
  }
});

// POST route - Allows to add a new item
app.post("/clothes", async (req, res) => {
  const { image, name, price, rating } = req.body;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const result = await collection.insertOne({ image, name, price, rating });
    const newItem = result.ops[0];

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item", err);
    res.status(500).send("Internal Server Error");
  }
});

// PUT route - Allows to update an item
app.put("/clothes/:id", async (req, res) => {
  const id = req.params.id;
  const { image, name, price, rating } = req.body;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { image, name, price, rating } },
      { returnOriginal: false }
    );

    const updatedItem = result.value;

    if (!updatedItem) {
      res.status(404).send("Not Found");
      return;
    }

    res.status(200).json(updatedItem);
  } catch (err) {
    console.error("Error updating item", err);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE route - Allows to delete an item
app.delete("/clothes/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection("items");

    const result = await collection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).send("Not Found");
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting item", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

**/
