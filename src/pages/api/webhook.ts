export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url, data } = req.body;

  if (!url || !data) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  try {
    console.log('Webhook URL:', url);
    console.log('Sending data:', data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://kalkulator.crocodile.dev'
      },
      body: JSON.stringify(data)
    });

    let responseData;
    try {
      const text = await response.text();
      responseData = JSON.parse(text);
    } catch (e) {
      console.error('Error parsing response:', e);
      responseData = null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return res.status(200).json({ 
      success: true, 
      data: responseData 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}