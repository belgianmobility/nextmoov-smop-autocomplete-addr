
const autocompleteIndexCreationBody = {
  settings: {
    number_of_shards: 1,
    analysis: {
      filter: {
        autocomplete_filter: {
          type: 'edge_ngram',
          min_gram: 1,
          max_gram: 20,
        },
      },
      analyzer: {
        autocomplete: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'lowercase',
            'autocomplete_filter',
          ],
        },
        autocomplete_folded: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'lowercase',
            'asciifolding',
            'autocomplete_filter',
          ],
        },
        folded: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'lowercase',
            'asciifolding',
          ],
        },
      },
    },
  },
};

const autocompleteIndexMappingBody = {
  properties: {
    text: {
      type: 'text',
      analyzer: 'autocomplete',
      search_analyzer: 'standard',
      fields: {
        folded: {
          type: 'text',
          analyzer: 'autocomplete_folded',
          search_analyzer: 'folded',
        },
      },
    },
  },
};

module.exports = {
  autocompleteIndexCreationBody,
  autocompleteIndexMappingBody,
};
