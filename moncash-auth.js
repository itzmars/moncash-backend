const axios = require("axios");
const qs = require("querystring");

const clientId = "16e2147c4a729eacb319fa09e1e2cea9";
const clientSecret =
  "crfiGOZB4mEAuvxrjTOFfP2iU2Sg1gE5TB4rF6TtUURt0CL1TwUcbRoxLApe8YHq";

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
