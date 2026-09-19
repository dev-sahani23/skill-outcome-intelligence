import { config } from 'dotenv';
config();
import Groq from 'groq-sdk';

(async () => {
  const g = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const r = await g.models.list();
  console.log("Available models:");
  r.data
    .sort((a: any, b: any) => a.id.localeCompare(b.id))
    .forEach((m: any) => console.log(`  ${m.id}`));
})();
