const express = require("express");
const Message = require("../models/Message");
const { SendMail, sendMailChimpEmail } = require("../helpers/mailing");
const router = express.Router();

// Send a message
router.post("/", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/send-notification", async (req, res) => {
  const { name, email, enquiry } = req.body;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Enquiry Received</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
    .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h2 { color: #6a1b9a; }
    .detail { margin-bottom: 10px; }
    .label { font-weight: bold; }
    .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Enquiry Received</h2>
    <div class="detail"><span class="label">Name:</span> ${name}</div>
    <div class="detail"><span class="label">Email:</span> ${email}</div>
    <div class="detail"><span class="label">Enquiry:</span><p>${enquiry}</p></div>
    <div class="footer">This message was sent from your vivaaha.us contact us form.</div>
  </div>
</body>
</html>
`;
  try {
    await SendMail(
      htmlContent,
      "Vivaaha Enquiry Notification",
      "vivaaha3@gmail.com"
    );
    res.json({ status: "success" });
  } catch (err) {
    res.json({ status: false });
  }
});

// Get all messages between two users
router.get("/:senderId/:receiverId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.params.senderId, receiverId: req.params.receiverId },
        { senderId: req.params.receiverId, receiverId: req.params.senderId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
