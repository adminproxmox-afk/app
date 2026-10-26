(function (window) {
  const values = Object.create(null);

  window.LCAMemoryStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    setItem(key, value) {
      values[key] = String(value);
    },
    removeItem(key) {
      delete values[key];
    },
    clear() {
      Object.keys(values).forEach((key) => delete values[key]);
    },
    key(index) {
      return Object.keys(values)[index] || null;
    },
    get length() {
      return Object.keys(values).length;
    }
  };
})(window);
