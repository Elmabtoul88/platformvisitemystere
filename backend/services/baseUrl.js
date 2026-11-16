const base_url = process.env.BASE_URL
  ? process.env.BASE_URL.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

module.exports = base_url;
