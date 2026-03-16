import { zh } from './zh';
import { en } from './en';

export const TRANSLATIONS = { zh, en };
export type LangType = keyof typeof TRANSLATIONS;
