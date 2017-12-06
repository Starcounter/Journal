const sourcesOfTruth = require('./sources');
const fetch = require('node-fetch');
const fs = require('fs');

const baseURL = 'https://api.github.com';

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

if (client_id) {
  console.log('Client ID env var exists');
} else {
  console.log('Client ID env var does not exist');
}
if (client_secret) {
  console.log('Client secret env var exists');
} else {
  console.log('Client secret env var does not exist');
}

const auth = `?client_id=${client_id}&client_secret=${client_secret}`;

async function getRepoSummary(repoName, repoReleasesURL) {
  const repoReleases = await fetch(repoReleasesURL).then(res => res.json());

  const latestTwoReleases = repoReleases.slice(0, 2);
  const latestTwoReleasesSummary = [];

  latestTwoReleases.forEach(release => {
    const { body, tag_name, published_at, html_url } = release;
    latestTwoReleasesSummary.push({
      body,
      tag_name,
      published_at,
      html_url
    });
  });
  return { type: 'repo', repoName, releases: latestTwoReleasesSummary };
}
async function downloadData() {
  const results = [];
  for (const source of sourcesOfTruth) {
    const listedOrg = { type: 'org', name: source.username, repos: [] };

    const allRepos = await fetch(
      `${baseURL}/users/${source.username}/repos${auth}`
    ).then(res => res.json());

    for (const repo of allRepos) {
      const repoName = repo.full_name;
      const repoReleasesURL = repo.releases_url.replace('{/id}', '') + auth;
      const repoSummary = await getRepoSummary(repoName, repoReleasesURL);
      if (repoSummary.releases.length) {
        listedOrg.repos.push(repoSummary);
      }
    }
    if (listedOrg.repos.length) {
      results.push(listedOrg);
    }
  }
  const data = {
    date: new Date().toLocaleString(),
    results
  };
  return data;
}

module.exports = downloadData;
