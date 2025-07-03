import axios from 'axios';

interface SMSConfig {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SMSConfig) {
  try {
    const data = {
      to,
      from: "Xtocast",
      message,
      type: "Quick"
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.kairosafrika.com/v1/external/sms/quick',
      headers: {
        'x-api-key': process.env.KAIROS_API_KEY,
        'x-api-secret': process.env.KAIROS_API_SECRET,
      },
      data: JSON.stringify(data)
    };

    const response = await axios(config);
    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
} 