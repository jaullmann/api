const { Router } = require("express");
const OrdersController = require("../controllers/OrdersController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const ordersRoutes = Router();

const ordersController = new OrdersController();

// ordersRoutes.use(ensureAuthenticated);

// ordersRoutes.get("/", ordersController.index);
ordersRoutes.post("/:user_id", ordersController.create);
// ordersRoutes.get("/:dish_id", ordersController.show);
// ordersRoutes.put("/:dish_id", ordersController.update);
// ordersRoutes.delete("/:dish_id", ordersController.delete);

module.exports = ordersRoutes;