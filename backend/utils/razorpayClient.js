import razorpay from "razorpay";

// Single Razorpay client, in its own module so tests can stub
// `razorpayInstance.orders.create/fetch` without any network access.
export const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
