import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import fetch from 'node-fetch';
import { Cards } from "./interfaces";
import { MongoClient, Collection } from 'mongodb';

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("port", process.env.PORT ?? 3000);

let mijnProject: MongoClient;
let dbCollection: Collection<Cards>;

const uri = process.env.MONGODB_URI || 'mongodb+srv://estalistrinev:tPqvaqEIdP7z9KM1@mijnproject.udzcq5y.mongodb.net/';
const client = new MongoClient(uri);

async function fetchDataAndWriteToMongoDB() {
    try {
        let cardsData = await fetch('https://raw.githubusercontent.com/s117507/WebOntwikkeling_Milestones/main/Project/MilestoneCards/card.json');
        let jsonData = await cardsData.json();
        let cards: Cards[] = jsonData as Cards[];

        const count = await dbCollection.countDocuments();
        if (count === 0) {
            await dbCollection.insertMany(cards);
            console.log('Data inserted into MongoDB');
        } else {
            console.log('Data already exists in MongoDB');
        }
    } catch (error) {
        console.error('Error fetching data and writing to MongoDB:', error);
    }
}

async function startServer() {
    try {
        await app.listen(app.get("port"));
        console.log("Server started on http://localhost:" + app.get("port"));
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

(async () => {
    try {
        await client.connect();
        mijnProject = client;
        dbCollection = mijnProject.db().collection('cards'); 

        console.log('Connected to MongoDB');

        await fetchDataAndWriteToMongoDB();
        await startServer();
    } catch (error) {
        console.error('Error:', error);
    }
})();

app.get("/", async (req, res) => {
    try {
        const { search, sortField, sortDirection } = req.query;

        let filteredCards: Cards[] = await dbCollection.find({}).toArray();

        if (search) {
            filteredCards = filteredCards.filter((card: Cards) => card.name.toLowerCase().includes(search.toString().toLowerCase()));
        }

        if (sortField && sortDirection) {
            filteredCards = filteredCards.sort((a: Cards, b: Cards) => {
                if (sortField === "name") {
                    return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                } else if (sortField === "rating") {
                    return sortDirection === "asc" ? a.rating - b.rating : b.rating - a.rating;
                } else if (sortField === "birthDate") {
                    return sortDirection === "asc" ? new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime() : new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
                } else {
                    return 0;
                }
            });
        }

        res.render("index", {
            title: "Card Game",
            cards: filteredCards,
            search: search || "", 
            sortField: sortField || "name",
            sortDirection: sortDirection || "asc" 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/edit/:name', async (req, res) => {
    try {
        const cardName = req.params.name;
        const card = await dbCollection.findOne({ name: cardName });

        if (!card) {
            return res.status(404).send("Card not found");
        }

        res.render('edit', { title: 'Edit Card', card });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/edit/:name', async (req, res) => {
    try {
        const cardName = req.params.name;
        const { name, description, type, rating } = req.body;

        const updatedCard = {
            name,
            description,
            type,
            rating: parseInt(rating) 
        };

        const result = await dbCollection.updateOne(
            { name: cardName },
            { $set: updatedCard }
        );

        if (result.modifiedCount === 1) {
            console.log('Card updated successfully');
            res.redirect('/');
        } else {
            console.error('Failed to update card');
            res.status(500).send('Failed to update card');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/detail/:name', async(req, res) => {
    try {
        const cardName = req.params.name;
        const card = await dbCollection.findOne({ name: cardName });

        res.render('detail', { title: 'Card Details', card });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.use((req, res) => {
    res.status(404).send("Sorry, the page you are looking for does not exist.");
});
