import fastify from "fastify";
import { connect, Schema, model } from "mongoose";
import fs from "fs";

const server = fastify({ logger: true });
connect("mongodb://localhost:27017/apiHotwing")
  .then(() => console.log("connecté"))
  .catch((erreur) => console.log(erreur));

const start = async () => {
  try {
    server.listen({ port: 3000 });
  } catch (err) {
    console.log(err);
  }
};

start();

const menuSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      quantity: {
        type: String,
        required: false,
      },
      unit: {
        type: String,
        required: false,
      },
      ingredientName: {
        type: String,
        required: false,
      },
    },
  ],
  step: [
    {
      step: {
        type: Number,
        required: false,
      },
      indication: {
        type: String,
        required: false,
      },
    },
  ],
});

const Menu = model("Menu", menuSchema);

server.post("/menu", async (request, reply) => {
  const recettesData = fs.readFileSync("scrapper/menu.json", "utf8");
  const recettes = JSON.parse(recettesData);

  for (const recette of recettes) {
    const { name, link, ingredients, step } = recette;
    const recetteMenu = new Menu({ name, link, ingredients, step });
    await recetteMenu.save();
  }

  reply.code(201).send("Recettes enregistrées avec succès !");
});

server.get("/menu", async (request, reply) => {
  const menu = await Menu.find();
  reply.code(200).send(menu);
});

server.get("/menu/:id", async (request, reply) => {
  const { id } = request.params;
  const menu = await Menu.findById(id);
  reply.code(200).send(menu);
});

server.get("/menu-search-by-name/:name", async (request, reply) => {
  const { name } = request.params;
  const menu = await Menu.find({ name: name });
  reply.code(200).send(menu);
});

server.get("/menu-search-by-ingredient/:ingredient", async (request, reply) => {
    const { ingredient } = request.params;
    const ingredientQuery = ingredient.replace("%20", " ");
    const menu = await Menu.find({
      "ingredients.ingredientName": ingredientQuery,
    });
    reply.code(200).send(menu);
  });
