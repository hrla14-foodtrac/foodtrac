const _ = require('lodash');
const Trucks = require('../db/trucks.model');
const { getBoundingBox, getLatestTruckLocation } = require('../utils');

module.exports = {
  get(req, res) {
    const boundingBox = getBoundingBox([req.query.lat, req.query.lng], req.query.dist || 50);
    Trucks.query()
      .eagerAlgorithm(Trucks.WhereInEagerAlgorithm)
      .eager('[brands.[food_genres, upvotes, menu_items, coupon, logo_image], locations]')
      .modifyEager('locations', (builder) => {
        getLatestTruckLocation(
          builder
            .whereBetween('lng', [boundingBox[0], boundingBox[2]])
            .andWhereBetween('lat', [boundingBox[1], boundingBox[3]]));
      })
      .then((trucks) => { /* eslint-disable no-param-reassign */
        trucks = _.filter(trucks, (truck) => {
          if (truck.locations.length > 0 && [truck.brands.food_genre_id, 0].includes(req.query.foodGenre)) {
            truck.locations = truck.locations[0];
            truck.brands.upvotes = _.filter(truck.brands.upvotes, upvote => upvote.timeline_id === truck.locations.timeline_id);
            return true;
          }
          truck.locations = null;
          return false;
        });
        res.status(200).send(trucks);
      })
      .catch(e => res.status(400).send(e.message));
  },
  post(req, res) {
    Trucks.query()
      .insert(req.body)
      .then(() => res.sendStatus(201))
      .catch((e) => {
        console.log('Error inserting new truck:', e);
        res.status(400).send(e.message);
      });
  },
};
