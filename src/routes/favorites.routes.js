const { Router } = require("express");
const FavoritesController = require("../controllers/FavoritesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const favoritesRoutes = Router();

const favoritesController = new FavoritesController();

favoritesRoutes.use(ensureAuthenticated);

favoritesRoutes.get("/", favoritesController.show);
favoritesRoutes.post("/", favoritesController.create);
favoritesRoutes.put("/", favoritesController.update);
favoritesRoutes.delete("/", favoritesController.delete);

module.exports = favoritesRoutes;