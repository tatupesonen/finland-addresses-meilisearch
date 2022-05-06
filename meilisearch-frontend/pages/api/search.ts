// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MeiliSearch } from "meilisearch";

type Data = {
  query: string;
};

export interface SearchResult {
  hits: Hit[];
  offset: number;
  limit: number;
  nbHits: number;
  exhaustiveNbHits: boolean;
  processingTimeMs: number;
  query: string;
}

export interface Hit {
  building_id: string;
  region: string;
  municipality: string;
  street: string;
  house_number: string;
  postal_code: string;
  latitude_wgs84: string;
  longitude_wgs84: string;
  building_use: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { q: query } = req.body;
  console.log(req.body);
  const meili = new MeiliSearch({
    host: "http://meilisearch:7700",
    apiKey: process.env.MEILI_MASTER_KEY,
  });
  const index = meili.index("fi-addresses");
  const result = await index.search(query);
  res.status(200).json(result);
}
