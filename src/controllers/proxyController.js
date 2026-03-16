import { forwardRequest } from '../services/proxyService.js';
export const handleProxyRequest = async (req, res) => {
    try {
        const proxyResponse = await forwardRequest(req);
        // Send the destination's status code and data back to the original client
        res.status(proxyResponse.status).json(proxyResponse.data);
    } catch (error) {
        console.error('🔴 Proxy Forwarding Error:', error);
        res.status(502).json({
            error: 'Bad Gateway',
            message: 'Failed to route request to destination service'
        });
    }
}