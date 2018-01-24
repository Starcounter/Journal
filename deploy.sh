# first publish, with CLIENT_ID and CLIENT_SECRET env_vars, this command returns the URL
url=`now -e CLIENT_ID=@client_id -e CLIENT_SECRET=@client_secret --public`

# You have to use the returned url from above to alias it to a custom one.
# Here I alias it to release-journal.now.sh
now alias "$url" release-journal