import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import * as data from './card.json';
import { Cards, GuildAfiliation } from "./interfaces";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let cards: Cards[]; 

app.get("/", async (req, res) => {
    let response = await fetch('https://raw.githubusercontent.com/s117507/WebOntwikkeling_Milestones/main/Project/MilestoneCards/card.json');
    cards = await response.json();

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
    const cardName = req.params.name;
    const card: Cards | undefined = cards.find((card) => card.name === cardName);


    res.render('detail', { title: 'Card Details', card });
});

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});