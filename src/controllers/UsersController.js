const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const checkUserExists = await knex("users").where('email', email);

    if (checkUserExists.length > 0) {
      throw new AppError("Este e-mail já está associado a outro usuário.");
    }

    const hashedPassword = await hash(password, 8);

    await knex("users").insert({ name, email, password: hashedPassword });

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const user_id = request.user.user_id;   
    const user = await knex("users").where('user_id', user_id);    
        
    if (!user) {
        throw new AppError("Usuário não encontrado.");            
    }
        
    const userWithUpdatedEmail = await knex("users").where('email', email);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.user_id) {
        throw new AppError("Este e-mail já está em uso.");
    }
    
    if ((password && !old_password) || (!password && old_password)) {
        throw new AppError("Você precisa digitar a senha antiga e a nova senha para que ela seja atualizada.")
    }

    if (password & old_password) {
        const checkOldPassword = await compare(old_password.toString(), user.password);
        const checkSamePasswords = await compare(password.toString(), user.password);

        if (!checkOldPassword) {
            throw new AppError("A senha antiga não confere.");
        }
        if (checkSamePasswords) {
            throw new AppError("A senha nova e a senha atual são iguais.");
        }
        
        user.password = await hash(password.toString(), 8); 
    }
        
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    
    await knex('users')
      .where('user_id', user_id)
      .update({
        name: user.name,
        email: user.email,
        password: user.password,
        updated_at: knex.fn.now()
    });

    return response.status(201).json();
  }
}

module.exports = UsersController;