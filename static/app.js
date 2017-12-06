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

function itemHasUnreads(item) {
    for (const repo of item.repos) {
        for (const release of repo.releases) {
            const hash = `${item.name}-${repo.repoName}-${release.tag_name}`;
            release.hash = hash;
            if (!checkAndCache(hash)) { // unread item
                return true;
            }
        }
    }
    return false;
}

fetch('/data.json').then(res => res.json()).then(data => {
    let items = data.results;
    for (const item of items) {
        item.unreadsCount = 0;
        for (const repo of item.repos) {
            for (const release of repo.releases) {
                const hash = `${item.name}-${repo.repoName}-${release.tag_name}`;
                release.hash = hash;
                release.read = checkAndCache(hash);
                release.body = release.body.trim() || "No notes provided";

                if (!release.read) {
                    item.unreadsCount++;
                }
            }
        }

    }
    items = items.sort((a, b) => b.unreadsCount - a.unreadsCount);
    new Vue({
        el: '#app',
        data: {
            items,
            updatedOn: data.date,
            appLoaded: true
        },
        methods: {
            formatDate(str) {
                const date = new Date(str);
                return date.toLocaleDateString();
            },
            setAsRead(release) {
                release.read = true;
                localStorage.setItem(release.hash, true);
            },
            markAllAsRead() {
                for (const item of this.items) {
                    for (const repo of item.repos) {
                        for (const release of repo.releases) {
                            this.setAsRead(release);
                        }
                    }

                    item.unreadsCount = 0;
                }
                this.items = this.items;
            }
        }
    })
});