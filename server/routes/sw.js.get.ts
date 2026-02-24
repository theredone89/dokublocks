import { defineEventHandler, setResponseHeader } from 'h3';

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/javascript; charset=utf-8');
  return "self.addEventListener('install', () => self.skipWaiting());";
});
