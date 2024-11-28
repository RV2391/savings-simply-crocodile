export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url, data } = req.body;

  if (!url || !data) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields',
      details: 'URL and data are required'
    });
  }

  try {
    console.log('Webhook request URL:', url);
    console.log('Webhook request data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const responseText = await response.text();
    console.log('Raw webhook response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, response: ${JSON.stringify(responseData)}`);
    }

    console.log('Webhook response:', responseData);
    
    return res.status(200).json({ 
      success: true, 
      data: responseData,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}