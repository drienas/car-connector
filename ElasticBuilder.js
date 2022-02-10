const axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const ELASTIC_API = process.env.ELASTIC_API || null;
if (!ELASTIC_API) throw `No ELASTIC_API environment variable set`;

module.exports = class Elastic {
  static addPagination(page = 1, perPage = 10) {
    return {
      page,
      perPage,
    };
  }
  static async filterSearch(args = {}) {
    const baseFilters = [
      {
        field: 'mobileid',
        type: 'must',
        operator: 'exists',
      },
      {
        field: 'bestandsstatus',
        operator: 'is',
        query: '1',
      },
    ];

    let ands = [];
    let useTypes = [];
    let colors = [];
    let gearbox = [];
    let fuelType = [];

    if (args.fahrzeugnummer) {
      ands.push({
        field: 'bestellnummer',
        type: 'match',
        operator: 'is',
        query: args.fahrzeugnummer,
      });
    }

    if (args.model) {
      ands.push({
        field: 'modell',
        type: 'wildcard',
        operator: 'is',
        query: args.model,
      });
    }

    if (args.make) {
      ands.push({
        field: 'hersteller',
        type: 'match',
        operator: 'is',
        query: args.make,
      });
    }

    if (args.priceFrom || args.priceTo) {
      ands.push({
        field: 'wwwpreis',
        type: 'range',
        operator: 'is',
        query: [
          args.priceFrom ? parseInt(args.priceFrom) : 0,
          args.priceTo ? parseInt(args.priceTo) : 100000000,
        ],
      });
    }

    if (args.powerHpFrom || args.powerHpTo) {
      ands.push({
        field: 'leistungps',
        type: 'range',
        operator: 'is',
        query: [
          args.powerHpFrom ? parseInt(args.powerHpFrom) : 0,
          args.powerHpTo ? parseInt(args.powerHpTo) : 100000000,
        ],
      });
    }

    if (args.powerKwFrom || args.powerKwTo) {
      ands.push({
        field: 'leistungkw',
        type: 'range',
        operator: 'is',
        query: [
          args.powerKwFrom ? parseInt(args.powerKwFrom) : 0,
          args.powerKwTo ? parseInt(args.powerKwTo) : 100000000,
        ],
      });
    }

    if (args.mileageFrom || args.mileageTo) {
      ands.push({
        field: 'kilometerstand',
        type: 'range',
        operator: 'is',
        query: [
          args.mileageFrom ? parseInt(args.mileageFrom) : 0,
          args.mileageTo ? parseInt(args.mileageTo) : 100000000,
        ],
      });
    }

    if (args.useType) {
      args.useType
        .split(',')
        .map((x) => x.trim())
        .forEach((x) =>
          useTypes.push({
            field: 'gebrauchtyp_fzgtool',
            type: 'match',
            operator: 'is',
            query: x,
          })
        );
    }

    if (args.color) {
      args.color
        .split(',')
        .map((x) => x.trim())
        .forEach((x) =>
          colors.push({
            field: 'grundfarbe',
            type: 'match',
            operator: 'is',
            query: x,
          })
        );
    }

    if (args.gearbox) {
      args.gearbox
        .split(',')
        .map((x) => x.trim())
        .forEach((x) =>
          gearbox.push({
            field: 'getriebe',
            type: 'match',
            operator: 'is',
            query: x,
          })
        );
    }

    if (args.fuelType) {
      args.fuelType
        .split(',')
        .map((x) => x.trim())
        .forEach((x) =>
          fuelType.push({
            field: 'kraftstoff',
            type: 'match',
            operator: 'is',
            query: x,
          })
        );
    }

    const query = {
      order: 'wwwpreis:asc',
      pagination: this.addPagination(
        args.page ? args.page : 1,
        args.perPage ? args.perPage : 10
      ),
      filter: [
        {
          and: [
            ...baseFilters,
            ...ands,
            { or: [...useTypes] },
            { or: [...colors] },
            { or: [...gearbox] },
            { or: [...fuelType] },
          ],
        },
      ],
    };

    console.log(JSON.stringify(query, null, 2));

    try {
      let data = await axios.post(`${ELASTIC_API}/api/v2/cars/filter`, query);
      return data.data;
    } catch (err) {
      console.log(err);
      return { hitsTotal: 0, stats: { count: 0 }, hits: [] };
    }
  }
};
