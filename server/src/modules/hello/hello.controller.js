import { getHelloMessage } from './hello.service.js';

export const helloController = (req, res) => {
  const payload = getHelloMessage();
  res.json(payload);
};
