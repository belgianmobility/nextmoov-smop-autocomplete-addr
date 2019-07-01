
const elasticsearch = require('elasticsearch');

const { autocompleteIndexCreationBody, autocompleteIndexMappingBody } = require('./elasticRecipes');

class Elastic {
  static async getClient(elasticHost) {
    const elasticClient = new elasticsearch.Client({
      host: elasticHost,
      log: 'error',
    });

    // ----- Check if index exists.
    {
      const exists = await elasticClient.indices.exists({
        index: 'address_highway',
      });

      if (!exists) {
        console.log('Create elastic index.');

        await elasticClient.indices.create({
          index: 'address_highway',
          body: autocompleteIndexCreationBody,
        });

        await elasticClient.indices.putMapping({
          index: 'address_highway',
          type: 'autocomplete',
          body: autocompleteIndexMappingBody,
        });
      }
    }

    {
      const exists = await elasticClient.indices.exists({
        index: 'address_admin_boundaries',
      });

      if (!exists) {
        console.log('Create elastic index.');

        await elasticClient.indices.create({
          index: 'address_admin_boundaries',
          body: autocompleteIndexCreationBody,
        });

        await elasticClient.indices.putMapping({
          index: 'address_admin_boundaries',
          type: 'autocomplete',
          body: autocompleteIndexMappingBody,
        });
      }
    }

    return elasticClient;
  }
}

module.exports = { Elastic };
