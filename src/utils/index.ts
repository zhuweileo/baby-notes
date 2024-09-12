export function getUUID() {
  return `${new Date().getTime()}/${Math.floor(Math.random() * 10000)}`;
}

export const db = {
  key: 'baby-notes',
  set(value) {
    wx.setStorageSync(this.key, value);
  },
  get() {
    return wx.getStorageSync(this.key) || {};
  }
}