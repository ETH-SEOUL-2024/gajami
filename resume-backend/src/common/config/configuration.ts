import * as dotenv from 'dotenv';
dotenv.config();
const path = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path });

export const configuration = () => {
  return {
    ...process.env,
  };
};
