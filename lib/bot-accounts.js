'use strict';

/**
 * A list of bot accounts that should never be processed when involved in on-call handoffs.
 * The handoff will be ignored when a bot account is going on or going off call.
 * Add each new bot account using the same object notation as existing ones
 */


module.exports = {
  'bounce': {
    'email': 'xxxx@mapbox.com'
  },
  'devnull': {
    'email': 'xxxxx@mapbox.com'
  },
  'devnull1': {
    'email': 'xxxxxx@mapbox.com'
  },
  'devnull2': {
    'email': 'xxxxxxx@mapbox.com'
  },
  'itbot': {
    'email': 'it-xxxxxxx@mapbox.com'
  }
};
