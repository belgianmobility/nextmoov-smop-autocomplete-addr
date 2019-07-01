
const elasticsearch = require('elasticsearch');

const CONFIG = require('../config');

async function elasticSearch(elastic, index, text) {
  return elastic.search({
    index,
    type: 'autocomplete',
    body: {
      size: 10,
      explain: true,
      query: {
        multi_match: {
          type: 'most_fields',
          query: text,
          fields: ['text', 'text.folded'],
        },
      },
    },
  });
}

function allResultSorter(a, b) {
  if (
    (a.hasMatchedBoundary)
        && (b.hasMatchedBoundary)
  ) {
    return a._score - b._score;
  } if (
    (a.hasMatchedBoundary)
        && (!b.hasMatchedBoundary)
  ) {
    return -1;
  } if (
    (!a.hasMatchedBoundary)
        && (b.hasMatchedBoundary)
  ) {
    return 1;
  }

  return a._score - b._score;
}


async function getElasticResults(text) {
  const elastic = new elasticsearch.Client({
    host: CONFIG.elasticConnection,
    log: 'error',
  });

  const searchResult = await elasticSearch(elastic, 'address_highway', text);
  const allResults = [];
  const collectedHighwayIds = [];
  const collectedAdminIds = [];

  for (const res of searchResult.hits.hits) {
    const highwayAdminBoundaryIds = JSON.parse(res._source.admin_boundaries);

    // ----- Extract used character from user input.
    const input = JSON.stringify(res._explanation);
    const regex = /weight\(text(.folded)?:(.+?) in .+?\)/g;
    let match;
    const terms = {};

    while (match = regex.exec(input)) {
      terms[match[2]] = true;
    }

    const searchParts = text.split(' ');
    const other = [];
    const numbers = [];
    const adminBoundaries = [];
    let hasMatchedBoundary = false;

    for (const searchPart of searchParts) {
      if (!Object.keys(terms).includes(searchPart.toLowerCase())) {
        if (searchPart.match(/[0-9]/)) {
          numbers.push(searchPart.replace(',', ''));
        } else {
          const searchResult2 = await elasticSearch(elastic, 'address_admin_boundaries', searchPart);

          if (searchResult2.hits.hits.length === 0) {
            other.push(searchPart);
          } else {
            let hasMatch = false;

            for (const a_hit of searchResult2.hits.hits) {
              const adminBoundaryIds = JSON.parse(a_hit._source.ids);

              for (const adminBoudaryId of adminBoundaryIds) {
                if (highwayAdminBoundaryIds.hasOwnProperty(adminBoudaryId)) {
                  hasMatch = true;
                  hasMatchedBoundary = true;
                  adminBoundaries.push({
                    text: a_hit._source.text,
                    adminId: adminBoudaryId,
                    highwayIds: Object.keys(highwayAdminBoundaryIds[adminBoudaryId]),
                  });

                  collectedAdminIds.push(adminBoudaryId);

                  for (const highwayId in highwayAdminBoundaryIds[adminBoudaryId]) {
                    collectedHighwayIds.push(highwayId);
                  }
                }
              }
            }

            if (!hasMatch) {
              other.push(searchPart);
            }
          }
        }
      }
    }

    if (adminBoundaries.length === 0) {
      for (const adminId in highwayAdminBoundaryIds) {
        adminBoundaries.push({
          adminId,
          highwayIds: Object.keys(highwayAdminBoundaryIds[adminId]),
        });

        collectedAdminIds.push(adminId);

        for (const highwayId in highwayAdminBoundaryIds[adminId]) {
          collectedHighwayIds.push(highwayId);
        }
      }
    }

    allResults.push({
      text: res._source.text,
      score: res._score,
      maxScore: searchResult.hits.max_score,
      numbers,
      hasMatchedBoundary,
      adminBoundaries,
      other,
    });
  }

  allResults.sort(allResultSorter);

  return {
    collectedAdminIds: collectedAdminIds.map(item => parseInt(item)),
    collectedHighwayIds: collectedHighwayIds.map(item => parseInt(item)),
    results: allResults,
  };
}

module.exports = {
  getElasticResults,
};
