// Twilio credentials are read from Netlify environment variables.
// Set these in Netlify: Site configuration > Environment variables
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM_NUMBER

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Twilio environment variables not configured.' })
    };
  }

  try {
    const { to, name, event: eventType } = JSON.parse(event.body);
    const firstName = (name || 'Friend').split(' ')[0];

    let message;
    if (eventType === 'park') {
      message = `Hi ${firstName}! Your spot at Pilates in the Park is CONFIRMED! 🌳\n\nDate: Thursday, June 25\nTime: 6:30 PM\nLocation: Île St-Bernard, Châteauguay\n\nOnce you're on the island, walk just past the manoir — we'll be on your left!\n\nSee you there! 🌿`;
    } else {
      message = `Hi ${firstName}! Your spot at the Pilates Pool Party is CONFIRMED! 🌊\n\nDate: July 12, 2025\nTime: 2:00 PM\nLocation: Beauharnois, QC\nHosted by: METHOD by mads x Posh Palates\n\nThe exact address will be sent to you shortly!\n\nSee you poolside! 🏊‍♀️`;
    }

    const body = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    );

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sid: data.sid })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
