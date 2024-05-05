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

app.get("/", (req, res) => {
    const html = `
    <header class="navbar">
        <img src="assets/478d8e49233e7de64a3cbb875e526807.png" alt="Logo">
        <nav>
            <ul>
                <li><a href="guesspokemon.html">Speel</a></li>
                <li><a href="overzicht.html">Overzicht</a></li>
                <li><a href="teamplanner.html">TeamPlanner</a></li>
                <li><a href="index.html">Uitloggen</a></li>
            </ul>
        </nav>
    </header>`;

    res.render("index", {
        title: "Card Game",
        navbar: html 
    });
});

app.get("/", (req: Request, res: Response) => {
    try {
        const cards: Cards[] = data; // Using the imported JSON data
        res.render('index', { cards }); // Passing the 'cards' variable to the EJS template
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});