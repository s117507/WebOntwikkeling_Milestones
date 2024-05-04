import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import * as data from './card.json';

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
    <nav>
    <ul>
        <li><a href="#">Speel</a></li>
        <li><a href="#">Overzicht</a></li>
        <li><a href="#">TeamPlanner</a></li>
        <li><a href="#">Uitloggen</a></li>
    </ul>
    </nav>
    </header>`;
    
    res.render("index", {
        title: "Card Game",
        navbar: html
    })
});

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});