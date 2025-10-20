import { v4 as uuidv4 } from 'uuid'

export const generateUUID = () => {
  return uuidv4()
}

export const generateShortId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Default export for backward compatibility
export default {
  newUuid: () => uuidv4(),
  generateUUID,
  generateShortId
}