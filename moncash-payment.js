const express = require("express");
const axios = require("axios");
const { getMonCashToken } = require("./moncash-auth");

const router = express.Router();

const MONCASH_CREATE_URL =
  "https://moncashbutton.digicelgroup.com/Api/v1/CreatePayment";
const MONCASH_VERIFY_URL =
  "https://moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment";
const MONCASH_REDIRECT_URL =
  "https://moncashbutton.digicelgroup.com/Moncash-payment/Payment/Redirect?token=";

/**
 * @route POST /moncash/create-payment
 * @desc Create a MonCash payment and return a redirect URL
 */
router.post("/create-payment", async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return res.status(400).json({ error: "Missing amount or orderId" });
  }

  try {
    const tokenData = await getMonCashToken();

    const response = await axios.post(
      MONCASH_CREATE_URL,
      { amount, orderId },
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const payment = response.data;

    if (payment.status === 202 && payment.payment_token?.token) {
      const redirectUrl = `${MONCASH_REDIRECT_URL}${payment.payment_token.token}`;
      return res.json({
        success: true,
        redirectUrl,
        token: payment.payment_token.token,
        createdAt: payment.payment_token.created,
        expiresAt: payment.payment_token.expired,
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to create payment",
      response: payment,
    });
  } catch (error) {
    console.error(
      "CreatePayment error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "CreatePayment request failed" });
  }
});

/**
 * @route GET /moncash/verify-payment/:token
 * @desc Verify the status of a MonCash transaction
 */
router.get("/verify-payment/:token", async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: "Missing payment token" });
  }

  try {
    const tokenData = await getMonCashToken();

    const response = await axios.post(
      MONCASH_VERIFY_URL,
      { paymentToken: token },
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const transaction = response.data;

    return res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(
      "VerifyPayment error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "VerifyPayment request failed" });
  }
});

/**
 * @route POST /moncash/payment-details
 * @desc Get payment details by transactionId or orderId
 */
router.post("/payment-details", async (req, res) => {
  const { transactionId, orderId } = req.body;

  if (!transactionId && !orderId) {
    return res.status(400).json({ error: "Missing transactionId or orderId" });
  }

  try {
    const tokenData = await getMonCashToken();

    const payload = transactionId ? { transactionId } : { orderId };

    const response = await axios.post(
      "https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment",
      payload,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      payment: response.data.payment,
      status: response.data.status,
      timestamp: response.data.timestamp,
    });
  } catch (error) {
    console.error(
      "Payment details error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to retrieve payment details" });
  }
});

module.exports = router;
