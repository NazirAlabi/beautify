/**
 * @file schemas.js
 * @description Standard schemas and type definitions for Beautify by Ramat's local database objects.
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier (e.g. timestamp-based).
 * @property {'income'|'expense'} type - The financial transaction flow direction.
 * @property {number} amount - The currency value of the transaction in Ghanaian Cedi (₵).
 * @property {string} category - The service name (for income) or expense category (for expense).
 * @property {string} date - ISO-8601 string representation of the transaction date.
 * @property {string} [clientName] - Name of the client (only for 'income' type transactions).
 * @property {'Cash'|'Card'|'Momo'|'Bank Transfer'} [paymentMethod] - Payment mode used (only for 'income' type).
 * @property {string} [vendor] - Vendor store name (only for 'expense' type transactions).
 * @property {string} [description] - Detailed text description (only for 'expense' type transactions).
 * @property {string} [notes] - Any optional notes added to the transaction.
 */
export const TransactionSchema = {
  id: 'string',
  type: 'income | expense',
  amount: 'number',
  category: 'string',
  date: 'string (ISO date)',
  clientName: 'string (optional)',
  paymentMethod: 'Cash | Card | Momo | Bank Transfer (optional)',
  vendor: 'string (optional)',
  description: 'string (optional)',
  notes: 'string (optional)'
};

/**
 * @typedef {Object} SocialMedia
 * @property {string} [instagram] - Instagram handle
 * @property {string} [snapchat] - Snapchat handle
 * @property {string} [tiktok] - TikTok username
 * @property {string} [whatsapp] - WhatsApp contact number
 *
 * @typedef {Object} Client
 * @property {string} id - Unique identifier.
 * @property {string} name - Full name of the client.
 * @property {string} [phone] - Mobile phone number contact.
 * @property {SocialMedia} [socialMedia] - Social media connection details.
 * @property {string} [notes] - Additional customer preferences or notes.
 */
export const ClientSchema = {
  id: 'string',
  name: 'string',
  phone: 'string (optional)',
  socialMedia: {
    instagram: 'string (optional)',
    snapchat: 'string (optional)',
    tiktok: 'string (optional)',
    whatsapp: 'string (optional)',
  },
  notes: 'string (optional)'
};

/**
 * @typedef {Object} Service
 * @property {string} id - Unique identifier.
 * @property {string} name - Name of the service (e.g. "Soft Glam").
 * @property {number} defaultPrice - Default cost of the service.
 */
export const ServiceSchema = {
  id: 'string',
  name: 'string',
  defaultPrice: 'number'
};

/**
 * @typedef {string} ExpenseCategory - Represents the string category name.
 */
export const ExpenseCategorySchema = 'string';
