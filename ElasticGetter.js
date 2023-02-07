const axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const ELASTIC_API = process.env.ELASTIC_API || null;
if (!ELASTIC_API) throw `No ELASTIC_API environment variable set`;
const ES_API_TOKEN = process.env.ES_API_TOKEN || null;
if (!ES_API_TOKEN) throw `No ES_API_TOKEN environment variable set`;

module.exports = async (args) => {
  if (args.fzg_id) {
    try {
      let data = await axios.get(
        `${ELASTIC_API}/api/v2/cars/index/${args.fzg_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ES_API_TOKEN}`,
          },
        }
      );
      data = data.data;
      if (!data.success) return {};
      else return data.car._source;
    } catch (err) {
      console.log(err);
      return { success: false, car: {} };
    }
  } else if (args.vin) {
    try {
      let data = await axios.get(
        `${ELASTIC_API}/api/v2/cars/full/${args.vin}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ES_API_TOKEN}`,
          },
        }
      );
      data = data.data;
      if (!data.success) return {};
      else return data.hits[0];
    } catch (err) {
      console.log(err);
      return { success: false, car: {} };
    }
  } else {
    return {};
  }
};
