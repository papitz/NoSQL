# Aufgabe 1

## Redis (key-value db):

```
docker run --name our-redis -d redis
docker run -it --name our-redis-cli --link our-redis:redis --rm redis redis-cli -h redis -p 6379
```

## Neo4j (graph db):

```
docker run \
    --name our-neo4j \
    -p7474:7474 -p7687:7687 \
    -d \
    -v $HOME/uni/NoSQL/neo4j/data:/data \
    -v $HOME/uni/NoSQL/neo4j/logs:/logs \
    -v $HOME/uni/NoSQL/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/uni/NoSQL/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/test \
    neo4j:latest
```

Browser runs on localhost:7474

```
username: neo4j
pw: test
```

## MongoDB (document db):

```
docker run --name our-mongodb -d -p 27017:27017 mongo
mongosh mongodb://localhost:27017
```

### Quellen

https://hub.docker.com/_/redis\
https://neo4j.com/developer/docker-run-neo4j/\
https://www.mongodb.com/compatibility/docker
