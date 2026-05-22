exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { url, body, contentType, sessionId } = JSON.parse(event.body);
    const headers = { 'Content-Type': contentType || 'application/json' };
    if (sessionId) headers['Cookie'] = `session_id=${sessionId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body
    });

    const setCookie = response.headers.get('set-cookie') || '';
    const sessionMatch = setCookie.match(/session_id=([^;]+)/);
    const newSessionId = sessionMatch ? sessionMatch[1] : null;
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        ...(newSessionId ? { 'X-Session-Id': newSessionId } : {})
      },
      body: JSON.stringify({ text, newSessionId })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
