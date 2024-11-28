export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url, data } = req.body;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.text();
    
    return res.status(response.status).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send webhook' });
  }
}