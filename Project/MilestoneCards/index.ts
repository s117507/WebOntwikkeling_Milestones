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

app.get("/", async(req, res) => {
    let response = await fetch('https://raw.githubusercontent.com/s117507/WebOntwikkeling_Milestones/main/Project/MilestoneCards/card.json')
    cards = await response.json();

    res.render("index", {
        title: "Card Game",
        cards
    });
});

app.get('/detail/:id', async(req, res) => {
    const cardId = req.params.id;
    const card: Cards | undefined = cards.find((card) => card.id === cardId);


    res.render('detail', { title: 'Card Details', card });
});

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});