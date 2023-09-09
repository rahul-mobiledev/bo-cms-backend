const https = require('https');
const { google } = require('googleapis');
const PROJECT_ID = process.env.PROJECT_ID

const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];
const key = {
    "type": "service_account",
    "project_id": "bo-cms-0",
    "private_key_id": "5c8975ac877c7e671f17fe958771592e546fe137",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQChhSD57AgC911m\nqsJEn/DkqTHHcc6qkSSsXIj8TuvQugGBgcRO271DZCN21veqnQqsoScHl6KEOcxK\n0YKiC07ErYf7dXnVPe+JwntfKAfxzn27eszHpPrRKRc6UIEdSPJaoUQBT+1XMEA8\nX1RIo9DRkDZ4QE9DxY6CF80pj1Nz6sIhmqFx+AnpUq65sZdhs/1RVR6MkPyyESuH\nrqSNUIQGCp/gUqeSoacBo+ViansfNv2sTTEi9q0ldjhX7zcICzIgZ3OYDPbkoheu\noim4MX4GQG1yQ1/1+AysviNdlA6EVX0FDTl+NeS8uA/5Urfdv+tguYrbF30bR4ed\nY3E5cNhVAgMBAAECggEADLLbR1rjvFv3V2mIcX3Doi6dL8mGTomvwO9bg76uso/V\nK3no1axYAnLeiOrYuOy02KKo32NwDwY+RgmXxCawcC0WelIfnIDMkt+b9HzAtyWd\nY/6BGBcj8wrQfTC0HfnMuAxivNmsVsT/39880KM0eS1l4ulncfQXwqmdYy2WCZBk\n7A4UioSL6nwMMtNObfIrIllapPEyrOOmP/8+wAZ/BFwC0xl2/jlrvU7Lx/rUDzxC\nSITUDANkPNsWcQr9RrhHLahN43ZIuINfuP/atWh8eRo9jpn2fDD6WAyxnd1BVATb\n7vEgzhinvGddqfXcK1pX45zVMjAAEoMF/Ozy/3EtUQKBgQDQU26RAoDxjuRJGyAm\nRAljIkVc11A8m4fcAjuoPIItPzouKTQnydtbLW7cl320a0B9jeN89ftE6CDBHKON\nZle/vVITRnZTpo9QnEhuv7Hn9Qc/5tT4kzpTnDXtMqlcXC5h8N12Ab3IzAJnJDge\nx8etMevefvMcIz+6ipAMQCA6nQKBgQDGe5763g8PD4iSV4TVinIucR4qYPiHJScA\nsHnt3mt256eFD93HxJSdBu7zJC2JwvoG8vVKG182C7uA0HPEYFztFh91vpAlDbm7\nJ1ajuueU/qF1P1aZwhzRSNKn3jXI37pl8ElQZ81msBb2pa3B5CKpWtAeCY53pjhR\nb5cOZ2HrGQKBgQCf2ZT6YdBtCbazPcQieIw3bAGLJo+jobfSokgCZEOC0oQjDWy+\npw3Q3YC2dOt4t98pN+l5ZgmiqvcPFpmMkx37uxoyPhvnPeOz9+dAS4kIMiSY7Nc3\n0UitBSz/z6LSgsz4S+iyds2YOKoTWGBThfn6NFcHR6PlUErDKTU0oTPZpQKBgQCA\nbeEy5pjL3/s45hR3sDutvVgNh+2IVQvlsEtVFURoDgEhYmDZMGQRLzlSbqhgqZ7q\n/C6nowp6iCDtevRNrySx7Eyy/Xl74GO7q/qtuvS6PgDvQuqgVzAaY4qbQHeA4PNV\nnqNxuZj4xxw0wIOsIBgliTN9HCXpWc67Mv+FPHPpkQKBgA3CExE6kHZnkz6L73hK\nPMLZmkfxVTYcUorA3quur2btCUNTCq9xKraLb8NHwko5rpldfxtQMyU38kLSY0x3\nPvhUo8Pofi4Sw9AhyQm3M/4QpOvXQRpzhF2rNWc/NzeGeXhw0Q3pmo3Y1yuy3SOx\nQULDCf7pMbCxHB/qgyE7jM7h\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-qoj18@bo-cms-0.iam.gserviceaccount.com",
    "client_id": "114143197416063796518",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qoj18%40bo-cms-0.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
  

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]
function getAccessToken() {
  return new Promise(function(resolve, reject) {
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}
// [END retrieve_access_token]

/**
 * Send HTTP request to FCM with given message.
 *
 * @param {object} fcmMessage will make up the body of the request.
 */
function sendFcmMessage(fcmMessage) {
  getAccessToken().then(function(accessToken) {
    const options = {
      hostname: HOST,
      path: PATH,
      method: 'POST',
      // [START use_access_token]
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
      // [END use_access_token]
    };

    const request = https.request(options, function(resp) {
      resp.setEncoding('utf8');
      resp.on('data', function(data) {
        console.log('Message sent to Firebase for delivery, response:');
        console.log(data);
      });
    });

    request.on('error', function(err) {
      console.log('Unable to send message to Firebase');
      console.log(err);
    });

    request.write(JSON.stringify(fcmMessage));
    request.end();
  });
}

/**
 * Construct a JSON object that will be used to define the
 * common parts of a notification message that will be sent
 * to any app instance subscribed to the news topic.
 */
function buildCommonMessage(title,body,image) {
  return {
    'message': {
      'topic': 'bo_cms_updates',
      'notification': {
        'title': title,
        'body': body,
      }
    }
  };
}

module.exports = {
  buildCommonMessage,
  sendFcmMessage
}