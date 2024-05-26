import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import * as data from './card.json';
import { Cards, Owner, User } from "./interfaces";
import { MongoClient } from "mongodb";
import { connect, getCards, updateCard, getCardByName, login, registerUser } from "./database";
import { title } from "process";
import bcrypt from 'bcrypt';
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(session);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

const uri = "mongodb+srv://estalistrinev:tPqvaqEIdP7z9KM1@mijnproject.udzcq5y.mongodb.net/?retryWrites=true&w=majority&appName=mijnProject"
const client = new MongoClient(uri);


app.get("/", secureMiddleware, async (req, res) => {
    if (req.session.user) {
        
    
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
        user: req.session.user,
        title: "Card Game",
        cards: filteredCards,
        search: search || "", 
        sortField: sortField || "name",
        sortDirection: sortDirection || "asc" 
    });
    } else {
        res.redirect("login");
    }
});






app.get('/detail/:name', async(req, res) => {
    let cards : Cards[] = await getCards();

    const cardName = req.params.name;
    const card: Cards | undefined = cards.find((card) => card.name === cardName);


    res.render('detail', { 
        title: 'Card Details', 
        card });
});

app.get('/form/:name/edit', async (req, res) => {
    const cardName = req.params.name;
    const card: Cards | null = await getCardByName(cardName);
  
    res.render('form', { 
      title: "Update Card",  
      card 
    });
  });
  
  app.post('/form/:name/update', async (req, res) => {
    const cardName = req.params.name;
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      rating: parseInt(req.body.rating, 10),
      type: req.body.type,
    };
  
    await updateCard(cardName, updatedData);
    res.redirect(`/detail/${cardName}`);
  });

  app.get('/registratie', async  (req, res) => {
    res.render('registratie', {
        title: "registratie"
    });
  })

  app.post("/register", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      await registerUser(username, password);
      res.redirect("/login");
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).send("Registration failed: ");
    }
  });

  app.get('/login', async  (req, res) => {
    res.render('login', {
        title: login
    });
  })

  app.post("/login", async(req, res) => {
    const username : string = req.body.username;
    const password : string = req.body.password;
    try {
        let user : User = await login(username, password);
        delete user.password; 
        req.session.user = username;
        res.redirect("/");
    } catch (e) {
        console.error(e);
        res.redirect("/login");
    }
});

app.get("/logout", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.post("/logout", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(3000, async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
});