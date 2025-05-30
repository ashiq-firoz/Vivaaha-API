//helpers/mailing.js

const axios = require('axios');
const MAILSERVER_URL = process.env.MAILSERVER_URL;
const url = new URL(MAILSERVER_URL);
const mailchimp = require('@mailchimp/mailchimp_transactional')(process.env.MAILCHIMP_KEY); 


async function sendMailChimpEmail(subject, content, recipientEmail) {
  try {
    const response = await mailchimp.messages.send({
      message: {
        from_email: process.env.SENDER_EMAIL, 
        subject: subject,
        text: content,
        to: [
          {
            email: recipientEmail,
            type: 'to',
          },
        ],
      },
    });
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}




async function SendMail(content, subject,ToEmail) {
    try {
        url.searchParams.append('companyEmail', ToEmail);
        const response = await axios.post(url.toString(), { 
            "content": content,
            "subject": subject 
        });
        return true;
    } catch (error) {
        console.error('Error sending mail:', error);
        throw {
            success: false,
            error: 'Failed to send mail',
            details: error.message
        };
    }
}

module.exports = {
    SendMail,
    sendMailChimpEmail
};