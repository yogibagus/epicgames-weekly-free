import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'healthy',
    service: 'Epic Games Scraper API',
    version: '1.0.0',
    endpoints: {
      '/api/epic/weekly-free': 'GET - Scrape Epic Games free games list',
      '/api/health': 'GET - API health check'
    },
    timestamp: new Date().toISOString()
  });
}

