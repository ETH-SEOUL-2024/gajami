import { configuration } from './../config/configuration';
import OpenAI from 'openai';

const API_KEY = configuration()['OPENAI_API_KEY'];
export const openAiClient = new OpenAI({ apiKey: API_KEY });