export const forwardRequest = async (req) => {
    // For demonstration, we will route traffic to a dummy API (JSONPlaceholder)
    const TARGET_BASE_URL = process.env.TARGET_URL || 'https://jsonplaceholder.typicode.com';
    
    // Construct the final URL (e.g., https://jsonplaceholder.typicode.com/users)
    const targetUrl = `${TARGET_BASE_URL}${req.originalUrl.replace('/api/v1', '')}`;
    
    console.log(`🌐 Proxying ${req.method} request to: ${targetUrl}`);

    // Forward the exact method, headers, and body (if present)
    const fetchOptions = {
        method: req.method,
        headers: {
            'Content-Type': req.headers['content-type'] || 'application/json',
            'Accept': 'application/json', // Tell the server we want JSON
            'User-Agent': 'Sentinel-API-Gateway/1.0', // Prevent the target server from dropping the connection
        },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(targetUrl, fetchOptions);

    // Parse the response from the destination service
    const data = await response.text();
    const parsedData = data ? JSON.parse(data) : {};

    return {
        status: response.status,
        headers: response.headers,
        data: parsedData,
        targetUrl
    };
};