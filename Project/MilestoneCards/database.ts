import { Collection, MongoClient} from "mongodb";
import { Cards, User } from "./interfaces";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
dotenv.config();

const saltRounds : number = 10;
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
export const cardsCollection : Collection<Cards> = client.db("Webontwikkeling").collection<Cards>("Cards");
export const userCollection : Collection<User> = client.db("Webontwikkeling").collection<User>("Users");

export async function getCards() {
    return await cardsCollection.find({}).toArray();
}

async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let username : string | undefined = process.env.ADMIN_USERNAME;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (username === undefined || password === undefined) {
        throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        username: username,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    })
}

export async function login(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Username and password required");
    }
    let user: User | null = await userCollection.findOne<User>({username: username});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function loadCardsFromDb() {
    const cards : Cards[] = await getCards();
    if (cards.length === 0) {
        console.log("Database is empty, loading users from Db");
    }
}

export async function updateCard(name: string, updatedData: Partial<Cards>) {
    return await cardsCollection.updateOne({ name: name }, { $set: updatedData });
  }

export async function getCardByName(name: string) {
    return await cardsCollection.findOne({ name: name });
  }  

export async function connect() {
    try {
        await client.connect();
        await loadCardsFromDb();
        await createInitialUser();
        console.log("Connected to database");
        process.on("SIGINT", exit)
    } catch (error) {
        console.error(error);
    }
}