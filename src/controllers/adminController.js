import { createApiKey } from "../services/adminService";

export const generateApiKey = async (req, res) => {
  try {
    const { clientName, role } = req.body;
    // 1. Validate the incoming HTTP request
    if (!clientName || !role) {
      return res
        .status(400)
        .json({ error: "clientName and role are required" });
    }
    // 2. Call the service to create the API key
    const apiKey = await createApiKey(clientName, role);
    // 3. Return the API key to the client
    res.status(201).json({
      message: "API Key generated successfully",
      data: newApiKeyRecord,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
