import moment from 'moment';
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import CreateEventForm from './CreateEventForm';
import combineDates from './util';
import post from '../../../api/event.api';
import propSchema from '../../common/PropTypes';
import EventsList from './EventsList';

// Todo: validate end time is after start time, and perhaps at least a minimum amount later

class EventsMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newEventDate: moment(),
      newEventTimeStart: null,
      newEventTimeEnd: null,
      newEventAddress: null,
    };

    this.selectDate = this.selectDate.bind(this);
    this.selectTimeStart = this.selectTimeStart.bind(this);
    this.selectTimeEnd = this.selectTimeEnd.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.selectAddress = this.selectAddress.bind(this);
  }

  selectDate(newEventDate) {
    this.setState({ newEventDate });
  }

  selectTimeStart(newEventTimeStart) {
    this.setState({ newEventTimeStart });
  }

  selectTimeEnd(newEventTimeEnd) {
    this.setState({ newEventTimeEnd });
  }

  selectAddress(newEventAddress) {
    this.setState({ newEventAddress });
  }

  submitForm(data) {
    const { newEventStart, newEventEnd } = combineDates(this.state.newEventDate,
      this.state.newEventTimeStart, this.state.newEventTimeEnd);
    const newEvent = {
      start: newEventStart,
      end: newEventEnd,
      name: data.name,
      description: data.description,
      owner_id: this.props.user.id,
    };
    const newLocation = {
      name: 'a new address',
      address: this.state.newEventAddress.gmaps.formatted_address,
      lat: this.state.newEventAddress.location.lat,
      lng: this.state.newEventAddress.location.lng,
    };
    post(newEvent, newLocation);
  }

  render() {
    return (
      <Switch>
        <Route
          path="/brand/:brandId/events/create"
          render={routeProps =>
          (<CreateEventForm
            {...routeProps}
            {...this.props}
            newEventDate={this.state.newEventDate}
            selectDate={this.selectDate}
            selectTimeStart={this.selectTimeStart}
            selectTimeEnd={this.selectTimeEnd}
            selectAddress={this.selectAddress}
            onSubmit={this.submitForm}
          />)}
        />
        <Route path="/brand/:brandId/events" render={routeProps => <EventsList {...routeProps} {...this.props} />} />
      </Switch>
    );
  }
}

EventsMain.propTypes = {
  user: propSchema.user,
};

const mapStateToProps = state => ({
  user: state.user,
});


export default connect(mapStateToProps)(EventsMain);
