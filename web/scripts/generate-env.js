const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const envConfig = `export const environment = {
  googleApiKey: '${process.env.GOOGLE_API_KEY}',
  placeId: '${process.env.PLACE_ID}',
  placesDetailsUrl: '${process.env.PLACE_DETAILS_URL}'
};`;

fs.writeFileSync('./src/environments/environment.ts', envConfig);
console.log('✅ environment.ts generated successfully');
