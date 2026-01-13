// backend/globalStore.js
global.__SYNCED_DATA__ = global.__SYNCED_DATA__ || [];

module.exports = {
  set(data) {
    global.__SYNCED_DATA__ = data;
  },
  get() {
    return global.__SYNCED_DATA__;
  },
  clear() {
    global.__SYNCED_DATA__ = [];
  }
};
