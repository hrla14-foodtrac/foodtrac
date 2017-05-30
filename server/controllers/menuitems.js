const MenuItems = require('../db/menuitems.model');

module.exports = {
  post(req, res) {
    // needs seeded FoodTypes table items to work
    MenuItems.query()
      .insert(req.body)
      .then(item => res.status(201).send(item))
      .catch(e => res.status(400).send(e.message));
  },
};
