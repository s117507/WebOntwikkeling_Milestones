import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import * as data from './card.json';
import { Cards, Owner } from "./interfaces";
import { MongoClient } from "mongodb";
import { connect, getCards } from "./database";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

const uri = "mongodb+srv://estalistrinev:tPqvaqEIdP7z9KM1@mijnproject.udzcq5y.mongodb.net/?retryWrites=true&w=majority&appName=mijnProject"
const client = new MongoClient(uri);


app.get("/", async (req, res) => {
    let cards : Cards[] = await getCards();

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






app.get('/detail/:name', async(req, res) => {
    let cards : Cards[] = await getCards();

    const cardName = req.params.name;
    const card: Cards | undefined = cards.find((card) => card.name === cardName);


    res.render('detail', { 
        title: 'Card Details', 
        card });
});

app.get('/form/:name', async(req, res) => {
    let cards : Cards[] = await getCards();
    const cardName = req.params.name;
    const card: Cards | undefined = cards.find((card) => card.name === cardName);

    res.render('form', {
        card
    });
})

app.listen(3000, async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
});