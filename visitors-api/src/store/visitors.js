/**
 * visitors.js — In-memory data store & ID generation
 * All visitor state lives here; no database required.
 */

let visitors = [];
let nextId = 1;

/**
 * Generate a unique, auto-incremented integer ID.
 * @returns {number}
 */
const generateId = () => nextId++;

/**
 * Return a shallow copy of the visitors array so callers
 * cannot accidentally mutate the internal store.
 */
const getAll = () => [...visitors];

/**
 * Find a single visitor by numeric ID.
 * @param {number} id
 * @returns {object|undefined}
 */
const getById = (id) => visitors.find((v) => v.id === id);

/**
 * Add a new visitor and return the created record.
 * @param {string} name
 * @returns {object}
 */
const add = (name) => {
  const visitor = {
    id: generateId(),
    name: name.trim(),
    checkInTime: new Date().toISOString(),
  };
  visitors.push(visitor);
  return visitor;
};

/**
 * Remove a visitor by ID.
 * @param {number} id
 * @returns {object|null} The removed visitor, or null if not found.
 */
const remove = (id) => {
  const index = visitors.findIndex((v) => v.id === id);
  if (index === -1) return null;
  const [removed] = visitors.splice(index, 1);
  return removed;
};

/**
 * Return the total count of visitors currently checked in.
 * @returns {number}
 */
const count = () => visitors.length;

export default { getAll, getById, add, remove, count };
