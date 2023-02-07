const axios = require('axios');

const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
} = require('graphql');

const $ELASTIC_SRC = process.env.ELASTIC_SRC || null;
if (!$ELASTIC_SRC) throw `No ElasticSource detected`;

let VehicleAttributes = {};
// let CustomerAttributes = {};

const gatherAsyncData = async () => {
  let request = await axios.get(`${$ELASTIC_SRC}/cars/_mapping`);
  if (request.status !== 200) throw `Can't resolve async Elastic Data`;
  let data = request.data;
  let mappings = data[Object.keys(data)[0]].mappings.properties;
  mappings = Object.keys(mappings).map((x) => ({
    name: x.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue'),
    type: mappings[x].type,
    resolve: (args) => (args[x] !== undefined ? args[x] : null),
  }));

  mappings.forEach(
    (x) =>
      (VehicleAttributes[x.name] = {
        type: ((t) => {
          switch (t) {
            case 'boolean':
              return GraphQLBoolean;
            case 'float':
              return GraphQLFloat;
            case 'long':
              return GraphQLInt;
            default:
              return GraphQLString;
          }
        })(x.type),
        resolve: x.resolve,
      })
  );

  // let request2 = await axios.get(`${$ElasticSrv}/customers/_mapping`);
  // if (request2.status !== 200) throw `Can't resolve async Elastic Data`;
  // let data2 = request2.data;
  // let mappings2 = data2[Object.keys(data2)[0]].mappings.properties;
  // mappings2 = Object.keys(mappings2).map((x) => ({
  //   name: x.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue'),
  //   type: mappings2[x].type,
  // }));
  // mappings2.forEach(
  //   (x) =>
  //     (CustomerAttributes[x.name] = {
  //       type: ((t) => {
  //         switch (t) {
  //           case 'boolean':
  //             return GraphQLBoolean;
  //           case 'float':
  //             return GraphQLFloat;
  //           case 'long':
  //             return GraphQLInt;
  //           default:
  //             return GraphQLString;
  //         }
  //       })(x.type),
  //     })
  // );

  return;
};

module.exports = {
  gatherAsyncData,
  VehicleAttributes,
  // CustomerAttributes,
};
