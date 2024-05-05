import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import fetch from 'node-fetch';
import { Cards } from "./interfaces";
import { MongoClient } from 'mongodb';

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("port", process.env.PORT ?? 3000);

let cards: Cards[] = [];
let mijnProject: MongoClient;

const uri = process.env.MONGODB_URI || 'mongodb+srv://estalistrinev:tPqvaqEIdP7z9KM1@mijnproject.udzcq5y.mongodb.net/';
const client = new MongoClient(uri);

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
        console.log('Connected to MongoDB');

        // Fetch cards data
        const response = await fetch('https://raw.githubusercontent.com/s117507/WebOntwikkeling_Milestones/main/Project/MilestoneCards/card.json');
        const jsonResponse = await response.json();
        cards = jsonResponse as Cards[];

        if (mijnProject) {
            await mijnProject.db().collection('cards').insertMany(cards);
            console.log('Inserted cards into MongoDB');
        } else {
            console.error('Error: mijnProject is not initialized');
        }
        
        await startServer();

    } catch (error) {
        console.error('Error:', error);
    }
})();

app.get("/", async (req: Request, res: Response) => {
    const { search, sortField, sortDirection } = req.query;

    let filteredCards = cards;
    if (search) {
        filteredCards = filteredCards.filter(card => card.name.toLowerCase().includes(search.toString().toLowerCase()));
    }

    if (sortField && sortDirection) {
        filteredCards = filteredCards.sort((a, b) => {
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
});

app.get('/detail/:name', async(req: Request, res: Response) => {
    const cardName = req.params.name;
    const card: Cards | undefined = cards.find((card) => card.name === cardName);

    res.render('detail', { title: 'Card Details', card });
});

app.use((req: Request, res: Response) => {
    res.status(404).send("Sorry, the page you are looking for does not exist.");
});
