//helpers/mailing.js

const axios = require('axios');
const MAILSERVER_URL = process.env.MAILSERVER_URL;
const url = new URL(MAILSERVER_URL);

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
    SendMail
};