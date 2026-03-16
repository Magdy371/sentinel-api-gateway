import { createApiKey } from '../services/adminService.js';

export const generateApiKey = async (req, res) => {
  try {
    const { clientName, role } = req.body;

    // 1. Validate the incoming HTTP request
    if (!clientName) {
      return res.status(400).json({ error: 'clientName is required' });
    }

    // 2. Pass the data to the Service layer
    const newApiKeyRecord = await createApiKey(clientName, role);

    // 3. Send the HTTP response
    res.status(201).json({
      message: 'API Key generated successfully',
      data: newApiKeyRecord
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};