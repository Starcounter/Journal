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

async function getRepoReleases(repoName, repoReleasesURL) {
  const repoReleases = await fetch(repoReleasesURL).then(res => res.json());

  const releases = [];
  
  repoReleases.forEach(release => {
    const { body, tag_name, published_at, html_url } = release; // pick only interesting rows
    releases.push({
      repoName,
      body: body || 'No notes provided',
      tag_name,
      hash: `${tag_name}#${repoName}#${published_at}`,
      published_at,
      published_at_unix_ts: new Date(published_at) / 1000,
      html_url
    });

  });
  return releases;
}
async function downloadData() {
  const releases = [];
  for (const source of sourcesOfTruth) {

    const allRepos = await fetch(
      `${baseURL}/users/${source.username}/repos${auth}`
    ).then(res => res.json());

    for (const repo of allRepos) {
      const repoName = repo.full_name;
      const repoReleasesURL = repo.releases_url.replace('{/id}', '') + auth;
      const repoReleases = await getRepoReleases(repoName, repoReleasesURL);
      if (repoReleases.length) {
        releases.push(...repoReleases);
      }
    }
  }
  const data = {
    date: new Date().toLocaleString(),
    releases
  };
  return data;
}

module.exports = downloadData;
