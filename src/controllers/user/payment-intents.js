const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/*   💳 Create a Payment Intent  */
const createPaymentIntent = async (req, res) => {
  try {
    // Assuming req.body is already parsed
    const { amount,currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(), // Convert currency to lowercase
    });

    return res.status(201).json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPaymentIntent,
};
