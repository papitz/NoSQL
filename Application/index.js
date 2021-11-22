const redis = require("redis"); // redis in memory db
const redisClient = redis.createClient(); // redis client

const {
    MongoClient
} = require("mongodb");
const mongoURI = "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongoURI);

// Connect the client to the server
mongoClient.connect();
// Establish and verify connection
mongoClient.db("db").command({
    ping: 1
});
console.log("Connected successfully to mongo server");

const mongoDatabae = mongoClient.db("db");
const plzCollection = mongoDatabae.collection("plz");

// CASSANDRA IMPORT
const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
});



// REST IMPORT
const express = require("express"); // REST module
const router = express.Router(); //
const app = express(); // middleware for parsing json

const fs = require("fs"); // nodejs files module
const path = require("path"); // path module for working with file and directory paths
const readline = require("readline"); // read line module
const {
    log
} = require("console");

const PORT = 8080;

//middleware
app.use(express.json()); // parse incoming json in the body
app.use(express.static(__dirname)); // serves the static content
app.use("/", router);

app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`)); // setting up the server

// sends the index.html file to the browser
router.get("/", function(_req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
});

// GET method for redis plz
app.get(`/redis/plz`, (req, res) => {
    console.log("Redis PLZ Time: ");
    console.time('redis');
    redisClient.hgetall(req.query.plz, function(_err, obj) {
        console.log(obj);
        res.status(200).send({
            obj,
        });
    });
    console.timeEnd('redis');
});

// GET method for redis city
app.get(`/redis/city`, (req, res) => {
    console.log("Redis city Time: ");
    console.time('redis');
    redisClient.smembers(req.query.city, function(_err, obj) {
        console.log(obj);
        res.status(200).send({
            obj,
        });
    });
    console.timeEnd('redis');
});

// GET method for mongo plz
app.get(`/mo/plz`, (req, res) => {
    console.log("MONGODB PLZ Time: ");
    console.time('mongo');
    let query = {
        plz: req.query.plz
    };
    console.log(query);
    plzCollection.findOne(query, function(_err, obj) {
        console.log(obj);
        res.status(200).send({
            obj,
        });
    });
    console.timeEnd('mongo');
});

// GET method for mongo city
app.get(`/mo/city`, (req, res) => {
    console.log("MONGODB City Time: ");
    console.time('mongo');
    let query = {
        city: req.query.city
    };
    plzCollection.find(query).toArray(function(_err, obj) {
        console.log(obj);
        res.status(200).send({
            obj,
        });
    });
    console.timeEnd('mongo');
});


// GET method for cassandra plz
app.get(`/cass/plz`, (req, res) => {
    console.log("CASSANDRA PLZ Time: ");
    console.time('cassandra');
    let query = 'SELECT * FROM plz.data WHERE zip = ?'
    console.log(query);
    client.execute(query, [req.query.plz], {
        prepare: true
    }, function(_err, obj) {
        console.log(obj.first());
        resSet = obj.first()
        res.status(200).send({
            resSet,
        });
    });
    console.timeEnd('cassandra');
});

// GET method for cassandra city
app.get(`/cass/city`, (req, res) => {
    console.log("CASSANDRA City Time: ");
    console.time('cassandra');
    let query = 'SELECT * FROM plz.data WHERE city = ? ALLOW FILTERING'
    client.execute(query, [req.query.city], {
        prepare: true
    }, function(_err, obj) {
        console.log(obj.rows)
        // console.log(obj.first());
        resSet = obj.rows
        res.status(200).send({
            "resSet": resSet
        });
    });
    console.timeEnd('cassandra');
});

// reading the plz.data file and convert it to objects
const rl = readline.createInterface({
    input: fs.createReadStream("plz.data"),
    crlfDelay: Infinity,
});

function fillRedis() {
    rl.on("line", (line) => {
        try {
            const entry = JSON.parse(line);
            let id = entry._id;
            let city = entry.city;
            let loc = entry.loc;
            let pop = entry.pop;
            let state = entry.state;
            // writing the data to redis
            redisClient.hset(
                id,
                "city",
                city,
                "loc",
                JSON.stringify(loc),
                "pop",
                pop,
                "state",
                state
            );

            // writing another index with sets of ids mapped to cities to redis
            redisClient.sadd(city, id);
        } catch (err) {
            console.log("Error parsing JSON string:", err);
        }
    });
    console.log("redis filled");
}

async function fillMongo() {
    plzCollection.deleteMany({}); // Deletes everything in the db
    let docs = fs.readFileSync("plz.data").toString().split("\n");
    let inputArray = [];
    try {
        for (const line of docs) {
            if (line != "") {
                let entry = JSON.parse(line);
                inputArray.push({
                    plz: entry._id,
                    city: entry.city,
                    loc: entry.loc,
                    pop: entry.pop,
                    state: entry.state,
                });
            }
        }
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
    plzCollection.insertMany(inputArray);
    console.log("mongo filled");
}

async function fillCassandra() {
    console.time("fillCassandra");
    let docs = fs.readFileSync("plz.data").toString().split("\n");
    try {
        for (const line of docs) {
            if (line != "") {
                let repLine = line.replace(/_id/, "zip")
                await client.execute("INSERT INTO plz.data JSON '" + repLine + "'");
            }
        }
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
    console.log("cassandra filled");
    console.timeEnd("fillCassandra");
}

console.time("fillRedis");
fillRedis();
console.timeEnd("fillRedis");
console.time("fillMongo");
fillMongo();
console.timeEnd("fillMongo");
//
// CASSANDRA QUERY
const createKeySpace = "CREATE KEYSPACE IF NOT EXISTS plz WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 };";
const createTable = "CREATE TABLE IF NOT EXISTS plz.data ( zip text PRIMARY KEY, city text, loc list <float>, pop int, state text);";
const createColumn = "ALTER TABLE plz.data ADD Fussball text;"
let getZIP = 'SELECT * FROM plz.data WHERE city = ? ALLOW FILTERING'
const updateFussball = "UPDATE plz.data SET Fussball = 'Ja' WHERE zip IN ?;"
const cities = ['BREMEN', 'HAMBURG'];

// Thank you js for this fucking bullshit
(async () => {
    await client.execute(createKeySpace)
    await client.execute(createTable)
    await client.execute(createColumn)
    await fillCassandra()
    let plzs = []
    let res1 = await client.execute(getZIP, [cities[0]], {
        prepare: true
    })
    let res2 = await client.execute(getZIP, [cities[1]], {
        prepare: true
    })
    for (const row of res1) {
        plzs.push(row.zip)
    }
    for (const row of res2) {
        plzs.push(row.zip)
    }
    client.execute(updateFussball, [plzs], {
        prepare: true
    })
})();
