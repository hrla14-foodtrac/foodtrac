const _ = require('lodash');
const Brands = require('../../db/brands.model');

module.exports = {
  put(req, res) {
    Brands.query()
      .findById(req.params.brandId)
      .patch(req.body)
      .then(brand => res.status(200).json(brand))
      .catch(e => console.log('Error updating brand:', e));
  },
  get(req, res) {
    // TODO: modify trucks.locations eager to only get current location
    const eagerOption = req.query.eager ? '[trucks.locations, food_genres]' : '';
    const currentTime = new Date();
    const latestValidTime = new Date(currentTime - 28800000);
    Brands.query()
      .findById(req.params.brandId)
      .eagerAlgorithm(Brands.WhereInEagerAlgorithm)
      .eager(eagerOption)
      .modifyEager('trucks.locations', (builder) => {
        builder
          .andWhereBetween('start', [latestValidTime.toISOString(), currentTime.toISOString()])
          .andWhere('end', 0)
          .orWhere('end', '>', currentTime.toISOString())
          .orderBy('start', 'desc');
      })
      .then((brand) => {
        brand.trucks = _.filter(brand.trucks, (truck) => { // eslint-disable-line no-param-reassign
          if (truck.locations.length > 0) {
            truck.locations = truck.locations[0]; // eslint-disable-line no-param-reassign
            return true;
          }
          return false;
        });
        res.status(200).json(brand);
      })
      .catch(e => console.log('Error fetching brand:', e));
  },
};
