import { REHYDRATE } from 'redux-persist/constants';
import _ from 'lodash';
import { actions as authActions } from '../auth';

const Immutable = require('seamless-immutable').static;

export const USER_RECEIVED = 'USER_RECEIVED';
export const USER_FAILURE = 'USER_FAILURE';
export const USER_NEW_FOLLOW = 'USER_NEW_FOLLOW';
export const USER_RM_FOLLOW = 'USER_RM_FOLLOW';
export const BRAND_INFO_UPDATE = 'BRAND_INFO_UPDATE';
export const REDIRECT_ADDBRAND_ENABLE = 'REDIRECT_ADDBRAND_ENABLE';
export const REDIRECT_ADDBRAND_DISABLE = 'REDIRECT_ADDBRAND_DISABLE';

const initialState = {
  id: null,
  email: null,
  is_truck_owner: false,
  auth0_id: null,
  // TODO: remove password later
  dummy_password: null,
  user_follows: [],
  brands: [],
  redirectToAddBrand: false,
};

export default function reducer(state = Immutable(initialState), action) {
  switch (action.type) {
    case REHYDRATE:
      if (action.payload.user) return Immutable.merge(state, action.payload.user);
      return state;
    case USER_RECEIVED:
      return Immutable.merge(state, action.user);
    // case USER_FAILURE:
    //   return Object.assign({}, state, { fetching: false, error: action.error });
    case BRAND_INFO_UPDATE:
      return Immutable.merge(state, { brands: [...state.brands[0], action.brand] });
    case USER_NEW_FOLLOW:
      return Immutable.merge(state, { user_follows: [...state.user_follows, action.newFollow] });
    case USER_RM_FOLLOW:
      return Immutable.merge(state, {
        user_follows: _.filter(state.user_follows, follow => follow.id !== action.brandId),
      });
    case REDIRECT_ADDBRAND_ENABLE:
      return Immutable.merge(state, { redirectToAddBrand: true });
    case REDIRECT_ADDBRAND_DISABLE:
      return Immutable.merge(state, { redirectToAddBrand: false });
    case authActions.LOGOUT:
      return Immutable(initialState);
    default:
      return state;
  }
}

export const userReceived = user => ({
  type: USER_RECEIVED,
  user,
});

export const userNewFollow = newFollow => ({
  type: USER_NEW_FOLLOW,
  newFollow,
});

export const userRemoveFollow = brandId => ({
  type: USER_RM_FOLLOW,
  brandId,
});

export const brandInfoUpdate = brand => ({
  type: BRAND_INFO_UPDATE,
  brand,
});

export const redirectAddBrandEnable = () => ({
  type: REDIRECT_ADDBRAND_ENABLE,
});

export const redirectAddBrandDisable = () => ({
  type: REDIRECT_ADDBRAND_DISABLE,
});

// export const userFailure = error => ({
//   type: USER_FAILURE,
//   error,
// });
