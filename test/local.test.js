'use strict';

const bots = require('../lib/bot-accounts');
const oncallEmail = 'trevor@mapbox.com';
const previouslyOnCall = 'jojo@mapbox.com';

const bottest = (bots) => {
  for (const bot of Object.values(bots)) {
    console.log(`bot: ${bot.email}; oncallEmail: ${oncallEmail}; previously oncall: ${previouslyOnCall}`);
    if (bot.email === oncallEmail || bot.email === previouslyOnCall) {
      console.log(`bot account ${bot.email} is involved in the handoff. No changes made to team settings.`);
      return -1;
    }
  }
  console.log('still going...');
};

bottest(bots);

// const Spoke = require('@mapbox/node-spoke');
// const spoke = new Spoke('general/IT/spoke/it-admin-api-token/');

// async function updateSpokeTeam () {
//   const updateTeamParams = {
//     'settings': {
//       'delegation': {
//         'strategy': 'SPECIFIC_USER',
//         'specificUser': '5cc33e88442dbe0007241ae8', // ignored when strategy is ROUND_ROBIN
//         'excludedUsers': [ // ignored when strategy is SPECIFIC_USER
//           '{user ID}'
//         ]
//       }
//     }
//   };
//   const updateTeamResponse = await spoke.updateTeam('5cb65407f38ee4000743e945', updateTeamParams);
//   console.log('updateTeamResponse:', updateTeamResponse.body);
// }

// // updateSpokeTeam();

// const event = {
//   'Records': [
//     {
//       'EventSource': 'aws:sns',
//       'EventVersion': '1.0',
//       'EventSubscriptionArn': 'arn:aws:sns:us-east-1:234858372212:oncall-askspoke-team-settings-test:9e44b7b5-4147-46f9-b0f3-39a0f3551b2f',
//       'Sns': {
//         'Type': 'Notification',
//         'MessageId': '7cfe2f8d-3fd9-5aa7-a4f1-78e1ae85c49c',
//         'TopicArn': 'arn:aws:sns:us-east-1:234858372212:oncall-askspoke-team-settings-test',
//         'Subject': 'trevor@',
//         'Message': '{\n  "detail-type": [\n    "On-call Handoff Event"\n  ],\n  "source": [\n    "on-call/handoff"\n  ],\n  "detail": {\n    "SpokeTeam": "IT",\n    "OnCallEmail": "trevor@mapbox.com"\n  }\n}',
//         'Timestamp': '2020-06-23T23:24:12.660Z',
//         'SignatureVersion': '1',
//         'Signature': 'm5U0vSCNTulCvKCHZHVBzF4r3CX8x5M432E5NM8Gto1thQRKVZINxEAhUUa2Yzr0bfc919TVl680A+BjqMsFRfJF8XVvgsG4QrIeP1UrPuG6AlXDHn8psRUSL/K9fPXHWsISBCOoOmrkWV+tAZbkYXvILxlUw38KMfwZkDwXzeKXL7w7meXuTE1S4J6UWYCCxZnT7vr+GDoKHT2JqHgg/DnD8J/TAIPrSVs96RfqbUG3O8SPFC+BF4D8F+qbCx6ZzfyJ123oOJmlysb7Xyh9iFBq+7ke0IGU95LrOvkirxfErc/QKTGnGhVF0yciO+mlSuBLVoz5A2zLA2pxIf/rxg==',
//         'SigningCertUrl': 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem',
//         'UnsubscribeUrl': 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:234858372212:oncall-askspoke-team-settings-test:9e44b7b5-4147-46f9-b0f3-39a0f3551b2f',
//         'MessageAttributes': {}
//       }
//     }
//   ]
// };

// // const message = event.Records[0].Sns.Message;
// // const parsedMessage = JSON.parse(message);

// // if (!('SpokeTeam' in parsedMessage.detail)) {
// //   console.log('missing: ', parsedMessage.detail.SpokeTeam);
// // }
