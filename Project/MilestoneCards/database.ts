import { Collection, MongoClient} from "mongodb";
import { Cards } from "./interfaces";
import dotenv from "dotenv";
dotenv.config();

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
export const cardsCollection : Collection<Cards> = client.db("Webontwikkeling").collection<Cards>("Cards");

export async function getCards() {
    return await cardsCollection.find({}).toArray();
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
        console.log("Connected to database");
        process.on("SIGINT", exit)
    } catch (error) {
        console.error(error);
    }
}