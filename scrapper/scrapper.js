import puppeteer from "puppeteer";
import fs from "fs";

async function getWrapper() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.allrecipes.com/recipes/17562/dinner");

  const menu = [];

  const div = await page.$(".mntl-taxonomysc-article-list-group");

  const spanTitres = await div.$$(".card__title-text");

  for (let i = 0; i < spanTitres.length; i++) {
    const span = spanTitres[i];
    const title = await span.evaluate((span) => span.innerText);
    const parent = await span.evaluateHandle(
      (span) => span.parentNode.parentNode.parentNode
    );
    const lienProperty = await parent.getProperty("href");
    const link = await lienProperty.jsonValue();
    const ingredientsAndStep = await recupIngredientAndStep(link, browser);
    menu.push({
      name: title,
      link,
      ingredients: ingredientsAndStep.allIngredients,
      step: ingredientsAndStep.allStep,
    });
  }

  const data = JSON.stringify(menu);
  fs.writeFile("menu.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log(
      "Les informations ont été enregistrées dans le fichier 'menu.json'"
    );
  });

  await browser.close();
}

async function recupIngredientAndStep(lien, browser) {
  const page = await browser.newPage();
  await page.goto(lien);
  const ingredients = await page.evaluate(() => {
    const allIngredients = [];
    const allStep = [];

    // pour les ingrédients
    const ulIngredient = document.querySelector(
      ".mntl-structured-ingredients__list"
    );
    const liIngredient = ulIngredient.querySelectorAll("li");
    liIngredient.forEach((ingredient) => {
      const spans = ingredient.querySelector("p").querySelectorAll("span");
      const quantity = spans[0].innerText;
      const unit = spans[1].innerText;
      const ingredientName = spans[2].innerText;
      allIngredients.push({ quantity, unit, ingredientName });
    });

    // Pour les steps
    const olStep = document.querySelector(".mntl-sc-block-group--OL");
    const liStep = olStep.querySelectorAll("li");
    let index = 0;
    liStep.forEach((step) => {
      index++;
      const indication = step.querySelector("p").innerText;
      allStep.push({ step: index, indication });
    });
    return { allIngredients, allStep };
  });
  await page.close();
  return ingredients;
}

getWrapper();
