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
    console.log('Sending data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const responseText = await response.text();
    console.log('Raw webhook response:', responseText);

    if (!response.ok) {
      console.error('Webhook error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });
      
      return res.status(response.status).json({
        success: false,
        error: `Webhook error: ${response.status} ${response.statusText}`,
        details: responseText
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Webhook sent successfully',
      response: responseText
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}