'use strict';

// initiate Spoke API client and pass secret prefix
const secretPrefixSpoke = process.env.AtHelpFriendToken;
const Spoke = require('@mapbox/node-spoke');
const spoke = new Spoke(secretPrefixSpoke);


// define parameters
const subjectMessage = `IT Stack alert. Stack: ${process.env.STACK_NAME}`;
const ticketTypeToFile = 'IT Dev Alert';

module.exports.postAlertTicket = async (bodyMessage) => {
  const requestType = await spoke.listRequestTypes({ q: ticketTypeToFile });
  const requestTypeId = requestType.body.results[0].id;
  const ItTeamId = '5cb65407f38ee4000743e945';
  // get Spoke user ID for @help friend
  const requester = await spoke.listUsers({ q: 'xxxxx-xxxx@mapbox.com' });
  const requesterId = requester.body.results[0].id;
  const owner = await spoke.listUsers({ q: 'xxxxx@mapbox.com' });
  const ownerId = owner.body.results[0].id;
  const requestBody = {
    subject: subjectMessage,
    body: `${bodyMessage}`,
    privacyLevel: 'private',
    requestType: requestTypeId,
    requester: requesterId,
    owner: ownerId,
    team: ItTeamId
  };
  await spoke.postRequest(requestBody);
};
