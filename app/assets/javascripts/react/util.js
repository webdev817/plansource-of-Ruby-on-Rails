import * as moment from 'moment';

const dateFromNow = (date) => {
	if (date) {
		return moment(date).fromNow();
  } else {
		return "";
  }
}

export default {
  dateFromNow,
};
