const knex = require("../database/knex");
const AppError = require("../utils/AppError");


class UserFavoritesController {

    async create(request, response) {
        const { title, category, description, ingredients, price } = request.body;
    
        const checkDishExists = await knex("dishes").where('title', title).first();
    
        if (checkDishExists) {
          throw new AppError("Já existe outro prato registrado com este nome.");
        }

        const [ dish_id ] = await knex("dishes").insert({
          title,
          category,
          description, 
          price
        })

        if (ingredients.length > 0) {
          const ingredientsInsert = ingredients.map(ingredient => {
            return {
              dish_id,
              name: ingredient
            }
          });
          await knex("ingredients").insert(ingredientsInsert);
        }
        
        return response.status(201).json();
    } 

    async show(request, response) {
      const { dish_id } = request.params;
      const dish = await knex("dishes").where("dish_id", dish_id).first();
      const ingredients = await knex("ingredients")
        .select("name")
        .where({"dish_id": dish_id})
        .orderBy("name")
        .pluck("name");
      
      return response.status(201).json({
        ...dish,
        ingredients
      });
    }

    async index(request, response) {
      const { search_key } = request.query;

      const distinctDishes = await knex("dishes")
        .distinct("dishes.*")
        .innerJoin("ingredients", "dishes.dish_id", "ingredients.dish_id")
        .where(
          builder => {
            builder.whereLike("dishes.title", `%${search_key}%`)
              .orWhereLike("dishes.description", `%${search_key}%`)
              .orWhereLike("ingredients.name", `%${search_key}%`)                            
            }
          )
        .whereNull("dishes.removed_at")   // filter removed (deleted) dishes that are no longer available
        .orderBy("dishes.title")
        .groupBy("dishes.dish_id") 
        .select("dishes.*");   
      
      const dishesWithIngredients = await Promise.all(distinctDishes.map(async dish => {
        const ingredients = await knex("ingredients")
          .select("name")
          .where("dish_id", dish.dish_id)
          .pluck("name"); 
        
        return { ...dish, ingredients };
        })        
      );
     
      return response.status(201).json(dishesWithIngredients);
    }
       
    async update(request, response) {
      const { title, category, description, ingredients, price } = request.body;
      const { dish_id } = request.params;      
      
      await knex("dishes")
        .where("dish_id", dish_id)
        .update({
          title, 
          category, 
          description, 
          price,
          updated_at: knex.fn.now()
      });

      await knex("ingredients").where("dish_id", dish_id).delete();

      if (ingredients) {
        const ingredientsInsert = ingredients.map(ingredient => {
          return {
            dish_id: dish_id,
            name: ingredient
          }
        });

        await knex("ingredients").insert(ingredientsInsert);
      }

      return response.status(201).json();
    }    

    async delete(request, response) {
      const { dish_id } = request.params;  
      
      const ordersWithDish = await knex("orders_details").where("dish_id", dish_id).first();      


      // check if there is any previous order with the target dish; in this case, the dish is not deleted to preserve the correct
      // detail from its linked orders
      if (ordersWithDish) {
        await knex("dishes")
          .where("dish_id", dish_id)
          .update({ removed_at: knex.fn.now() });
      } else {
        // if the dish has never been sold, then the delete procedure is performed
        await knex("dishes").where("dish_id", dish_id).delete();
      }     

      return response.status(201).json();
    }    

}

module.exports = UserFavoritesController;