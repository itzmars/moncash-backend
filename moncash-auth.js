const axios = require("axios");
const qs = require("querystring");

const clientId = "75a46d06c9288e16df9daa5561d9eb54";
const clientSecret =
  "utIRs4ZlwdC70B5S_9ySghQLiwliZT-lLoRhMftWo4llepJYVzJH-xGFAefVAdGn";

const getMonCashToken = async () => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      "https://sandbox.moncashbutton.digicelgroup.com/Api/oauth/token",
      qs.stringify({
        scope: "read,write",
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("MonCash auth error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getMonCashToken };
