import { v4 as uuidv4 } from "uuid";

export const generateClientId = (): string => {
  const clientId: string = uuidv4();
  return clientId;
};
