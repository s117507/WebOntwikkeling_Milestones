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
    res.render("index", {
        title: "Card Game"
    });
});

app.get("/", (req, res) => {
    try {
        const cards : Cards[] = data; // Using the imported JSON data
        res.render('index', { cards }); // Passing the 'cards' variable to the EJS template
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});