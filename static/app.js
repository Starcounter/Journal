const converter = new showdown.Converter();
function convertMarkdown(md) {
  return converter.makeHtml(md);
}

function checkAndCache(item) {
  const isRead = localStorage.getItem(item);
  if (isRead) {
    return true;
  }
}

function itemHasUnreads(repo) {
  for (const release of repo.releases) {
    const hash = `${repo.repoName}#${release.tag_name}`;
    release.hash = hash;
    if (!checkAndCache(hash)) {
      // unread item
      return true;
    }
  }
  return false;
}

fetch('/data.json')
  .then(res => res.json())
  .then(data => {
    let items = data.results;
    // each item is an org

    // flatten orgs into repos
    let repos = [];
    for (const item of items) {
      item.unreadsCount = 0;
      for (const repo of item.repos) {
        for (const release of repo.releases) {
          const hash = `${repo.repoName}#${release.tag_name}`;
          release.hash = hash;
          release.read = checkAndCache(hash);
          release.body = release.body.trim() || 'No notes provided';
          release.unixTimeStamp = new Date(release.published_at) / 1000;
        }
        // sort by release dates
        repo.releases = repo.releases.sort(
          (a, b) => b.unixTimeStamp - a.unixTimeStamp
        );
        repo.lastReleaseDate = repo.releases[0].unixTimeStamp;
        repos.push(repo);
      }
    }
    // sort them by date
    repos = repos.sort((a, b) => b.lastReleaseDate - a.lastReleaseDate);

    new Vue({
      el: '#app',
      data: {
        repos,
        updatedOn: data.date,
        appLoaded: true
      },
      methods: {
        formatDate(str) {
          const date = new Date(str);
          return date.toLocaleDateString('en-GB');
        },
        setAsRead(release) {
          release.read = true;
          localStorage.setItem(release.hash, true);
        },
        markAllAsRead() {
          for (const repo of this.repos) {
            for (const release of repo.releases) {
              this.setAsRead(release);
            }
          }
          this.repos = this.repos;
        }
      }
    });
  });
