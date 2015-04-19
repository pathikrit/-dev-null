# ack.mo (aka. the working title)

## Global deps
Install couchdb
```
brew install couchdb
```

```
npm install -g nodemon react-tools
```

## building the frontend

```
cd www
bower i
./watch.sh
```

## start the db
```
couchdb -b
curl http://127.0.0.1:5984/
```

```

## starting the server

```
npm i
npm start
```