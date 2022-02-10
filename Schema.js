const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
} = require('graphql');

const axios = require('axios');
const Elastic = require('./ElasticBuilder');
const validate = require('./Validation');

const Vehicle = new GraphQLObjectType({
  name: 'Vehicle',
  fields: {
    fzg_id: {
      type: GraphQLString,
    },
    fahrzeugnummer: {
      type: GraphQLString,
      resolve: (args) => args.bestellnummer,
    },
    zustand: {
      type: GraphQLString,
      resolve: (args) => args.gebrauchtyp_fzgtool,
    },
    getriebe: {
      type: GraphQLString,
    },
    beschreibung: {
      type: GraphQLString,
      resolve: (args) => {
        let parts = [
          args.hersteller,
          args.modell,
          args.modelltyp,
          args.ausstattungslinie_fzgtool,
        ];
        return parts.filter((x) => !!x).join(' ');
      },
    },
    laufleistung: {
      type: GraphQLInt,
      resolve: (args) => args.kilometerstand,
    },
    leistungKW: {
      type: GraphQLInt,
      resolve: (args) => args.leistungkw,
    },
    leistungPS: {
      type: GraphQLInt,
      resolve: (args) => args.leistungps,
    },
    erstzulassung: {
      type: GraphQLString,
      resolve: (args) => {
        let isEz = args.erstzulassung_fzgtool;
        return ((d) =>
          `${String(d.getUTCMonth() + 1).padStart(
            2,
            '0'
          )}/${d.getUTCFullYear()}`)(new Date(isEz));
      },
    },
    preis: {
      type: GraphQLFloat,
      resolve: (args) => args.wwwpreis,
    },
    imageData: {
      type: new GraphQLObjectType({
        name: 'Photofairy',
        fields: {
          exist: {
            type: GraphQLBoolean,
            resolve: (args) => {
              return args.found;
            },
          },
          images: {
            type: new GraphQLList(
              new GraphQLObjectType({
                name: 'Images',
                fields: {
                  baseUrl: {
                    type: GraphQLString,
                    resolve: (args) => {
                      return args.url;
                    },
                  },
                  rawUrl: {
                    type: GraphQLString,
                    resolve: (args) => {
                      return `https://cdn1.dieschneidergruppe.de/images/v1/raw${args.url}`;
                    },
                  },
                  brandUrl: {
                    type: GraphQLString,
                    resolve: (args) => {
                      return `https://cdn1.dieschneidergruppe.de/images/v2/brand/BRANDDSG${args.url}`;
                    },
                  },
                  borUrl: {
                    type: GraphQLString,
                    resolve: (args) => {
                      return `https://cdn1.dieschneidergruppe.de/images/v2/brand/BRANDBOR${args.url}`;
                    },
                  },
                },
              })
            ),
            resolve: (args) =>
              args.images && args.images.length > 0
                ? args.images.map((x) => ({ url: x }))
                : [],
          },
        },
      }),
      resolve: async (args) => {
        let vin = args.fahrgestellnr;
        if (!!vin) {
          let request = await axios.get(
            `https://cdn1.dieschneidergruppe.de/images/v1/status/${vin}`
          );
          if (request.status === 200) {
            let data = request.data;
            if (data.success) {
              return data;
            }
          }
          return {};
        }
        return {};
      },
    },
  },
});

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Das Root-Query Element',
    fields: () => ({
      VehicleDetails: {
        type: Vehicle,
        description: 'Fahrzeugdetails für einzelnes Fahrzeug',
        args: {
          fzg_id: {
            type: GraphQLString,
            description: 'Die interne Fahrzeug-Id',
          },
        },
        resolve: (_, args) => {
          return { fzg_id: '123' };
        },
      },
      VehicleSearch: {
        type: new GraphQLObjectType({
          name: 'SearchResult',
          fields: {
            vehicles: {
              type: new GraphQLList(Vehicle),
              resolve: (args) => args.hits,
            },
            hitsTotal: {
              type: GraphQLInt,
            },
            resultCount: {
              type: GraphQLInt,
              resolve: (args) => args.stats.count,
            },
          },
        }),
        args: {
          fahrzeugnummer: {
            description: 'interne Fahrzeugnummer',
            type: GraphQLString,
          },
          page: {
            description: '(Pagination) Seite',
            type: GraphQLInt,
          },
          perPage: {
            description: '(Pagination) Treffer pro Seite',
            type: GraphQLInt,
          },
          make: {
            description: 'Marke',
            type: GraphQLString,
          },
          model: {
            description: 'Modell',
            type: GraphQLString,
          },
          priceFrom: {
            description: 'Preis (min)',
            type: GraphQLInt,
          },
          priceTo: {
            description: 'Preis (max)',
            type: GraphQLInt,
          },
          mileageFrom: {
            description: 'Kilometerstand (min)',
            type: GraphQLInt,
          },
          mileageTo: {
            description: 'Kilometerstand (max)',
            type: GraphQLInt,
          },
          useType: {
            description:
              'Gebrauchtyp [Neuwagen, Gebrauchtwagen, Vorführwagen, Tageszulassung, Oldtimer]',
            type: GraphQLString,
          },
          color: {
            description: 'Grundfarbe',
            type: GraphQLString,
          },
          gearbox: {
            description:
              'Getriebeart [Schaltgetriebe, Automatik, Halbautomatik]',
            type: GraphQLString,
          },
          powerHpFrom: {
            description: 'Leistung (PS) (min)',
            type: GraphQLInt,
          },
          powerHpTo: {
            description: 'Leistung (PS) (max)',
            type: GraphQLInt,
          },
          powerKwFrom: {
            description: 'Leistung (kW) (min)',
            type: GraphQLInt,
          },
          powerKwTo: {
            description: 'Leistung (kW) (max)',
            type: GraphQLInt,
          },
          fuelType: {
            description:
              'Krafstoffart [Diesel, Benzin, Elektro, LPG-Autogas, Erdgas, Wasserstoff, Benzin+Elektro, Diesel+Elektro, Ethanol, Benzin+Ethanol, Diesel+Ethanol]',
            type: GraphQLString,
          },
        },
        description: 'Fahrzeugsuche',
        resolve: async (_, args) => {
          // Validation
          validate(args);
          let data = await Elastic.filterSearch(args);
          return data;
        },
      },
    }),
  }),
});

module.exports = { Schema };
