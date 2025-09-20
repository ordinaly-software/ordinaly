import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!API_KEY) return res.status(500).json({ error: 'Missing server-side GOOGLE_MAPS_API_KEY' });

  const { text, placeId } = req.query;

  try {
    if (placeId) {
      const pid = String(placeId);
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(pid)}&fields=name,rating,user_ratings_total,place_id&key=${API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsJson = await detailsRes.json();
      return res.status(200).json({ placeId: pid, details: detailsJson.result });
    }

    if (!text) return res.status(400).json({ error: 'Provide `text` (query) or `placeId`' });
    const q = String(text);
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(q)}&inputtype=textquery&fields=place_id,name&key=${API_KEY}`;
    const findRes = await fetch(findUrl);
    const findJson = await findRes.json();
    if (!findJson || !findJson.candidates || findJson.candidates.length === 0) return res.status(404).json({ error: 'Place not found' });
    const found = findJson.candidates[0];
    const pid = found.place_id;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(pid)}&fields=name,rating,user_ratings_total,place_id&key=${API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsJson = await detailsRes.json();

    return res.status(200).json({ placeId: pid, details: detailsJson.result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch' });
  }
}
