import { getOEMDatabase } from '../../lib/notion';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await getOEMDatabase();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
