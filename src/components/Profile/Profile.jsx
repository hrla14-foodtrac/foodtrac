import React, { Component } from 'react';
import { Grid, Row } from 'react-flexbox-grid';
import _ from 'lodash';
import axios from 'axios';
import { connect } from 'react-redux';
import propSchema from '../common/PropTypes';
import { actions as profileActions } from '../../redux/CurrentProfile';
import { actions as loadingActions } from '../../redux/Loading';
import Cover from './Cover';
import ProfileInfo from './ProfileInfo';
import TabView from './TabView';
import './cover.scss';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      brandId: parseInt(this.props.match.params.brandId, 10),
      brand: {
        name: '',
        description: '',
        food_genres: { name: '' },
        trucks: [],
        brand_comments: [],
        menu_items: [],
        cover_image: { filename: '' },
        logo_image: { filename: '' },
      },
      markers: [],
    };
    this.getBrandDetail = this.getBrandDetail.bind(this);
    this.submitComment = this.submitComment.bind(this);
    this.editComment = this.editComment.bind(this);
    this.removeComment = this.removeComment.bind(this);
  }

  componentDidMount() {
    this.getBrandDetail(this.state.brandId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.upvotes !== nextProps.upvotes) {
      this.getBrandDetail(nextProps.match.params.brandId);
    }
    if (nextProps.match.params.brandId !== this.props.match.params.brandId) {
      this.getBrandDetail(nextProps.match.params.brandId);
    }
  }

  getBrandDetail(brandId) {
    this.props.dispatch(loadingActions.startLoading());
    axios.get(`/api/brands/${brandId}?eager=true`)
      .then((res) => {
        const markers = res.data.trucks.reduce((result, truck) => {
          if (truck.locations) {
            result.push({
              position: {
                lat: truck.locations.lat,
                lng: truck.locations.lng,
              },
              key: truck.locations.id,
              defaultAnimation: 2,
            });
          }
          return result;
        }, []);
        res.data.trucks.forEach((truck) => {
          truck.brands = { // eslint-disable-line no-param-reassign
            name: res.data.name,
            description: res.data.description,
            food_genres: res.data.food_genres,
            fromProfile: true,
            logo_image: res.data.logo_image,
          };
        });
        this.setState({
          brandId: parseInt(this.props.match.params.brandId, 10),
          brand: res.data,
          markers,
        });
        this.props.dispatch(loadingActions.endLoading());
        this.props.dispatch(profileActions.newBrandProfile(res.data.upvotes));
      })
      .catch(err => console.log(err));
  }

  submitComment({ text }) {
    axios.post(`/api/brands/${this.state.brandId}/comments`, {
      text,
      user_id: this.props.user.id,
      brand_id: this.state.brandId,
    })
      .then(({ data }) => {
        const modifiedData = data;
        const newBrand = _.cloneDeep(this.state.brand);
        modifiedData.brand_reviews = this.props.user.brand_reviews;
        newBrand.brand_comments = [modifiedData, ...newBrand.brand_comments];
        this.setState({ brand: newBrand });
      })
      .catch(e => console.log('Error adding comment', e));
  }

  editComment(text, commentId, idx) {
    axios.put(`/api/brands/${this.state.brandId}/comments/${commentId}`, { text })
      .then(({ data }) => {
        const newBrand = _.cloneDeep(this.state.brand);
        newBrand.brand_comments[idx] = _.merge(newBrand.brand_comments[idx], data);
        this.setState({ brand: newBrand });
      })
      .catch(e => console.log('Error editing comment', e));
  }

  removeComment(commentId, idx) {
    axios.delete(`/api/brands/${this.state.brandId}/comments/${commentId}`)
      .then(() => {
        const newBrand = Object.assign({}, this.state.brand, {
          brand_comments: _.filter(this.state.brand.brand_comments, (com, i) => i !== idx),
        });
        this.setState({ brand: newBrand });
      })
      .catch(e => console.log('Error removing comment:', e));
  }

  render() {
    return (
      <Grid fluid>
        <Row className="coverRow">
          <Cover coverImage={this.state.brand.cover_image} />
        </Row>
        <Row>
          <ProfileInfo
            brandId={this.state.brandId}
            brandName={this.state.brand.name}
            description={this.state.brand.description}
            foodGenre={this.state.brand.food_genres.name}
            path={this.props.match.path}
            user={this.props.user}
            trucks={this.state.brand.trucks}
            upvotes={this.props.upvotes}
            logo={this.state.brand.logo_image}
          />
          <TabView
            brand={this.state.brand}
            brandId={this.state.brandId}
            brandName={this.state.brand.name}
            comments={this.state.brand.brand_comments}
            trucks={this.state.brand.trucks}
            userId={this.props.user.id}
            removeComment={this.removeComment}
            editComment={this.editComment}
            markers={this.state.markers}
            getBrand={this.getBrandDetail}
            menuItems={this.state.brand.menu_items}
            submitComment={this.submitComment}
            defaultCouponId={this.state.brand.default_coupon_id}
            rewardTrigger={this.state.brand.rewards_trigger}
            coupon={this.state.brand.coupon}
          />
        </Row>
      </Grid>
    );
  }
}

Profile.propTypes = {
  match: propSchema.match,
  user: propSchema.user,
  upvotes: propSchema.upvotes,
  dispatch: propSchema.dispatch,
};

const mapStateToProps = ({ user, profile }) => ({
  user,
  profile,
});

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
