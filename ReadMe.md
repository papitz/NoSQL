# NoSQL Praktikum Semester 6

## Aufgabe 1-3

Dokumentation siehe Ordner Aufg1

## Aufgabe 4

siehe https://github.com/BennyOe/S6NoSQL

## Aufgabe 5

Folgender Graph wird in der Aufgabe umgesetzt:
![Graph](./Aufg2/courses.png)

Hierbei bedeuten die Kanten, dass die Informationen aus einem Kurs in dem anderen gebraucht werden.\

Um den Graphen in die Datenbank einzufügen wird ein Cypher [Skript](./Aufg2/cypher_code.cypher) verwendet.\
Im ersten Teil des Skriptes werden alle bisherigen besuchten Kurse als Knoten hinzugefügt.
Dies geschieht mit Hilfe folgender Notation:

```cypher
CREATE (x:Course {name: "X"})
```

Hierbei ist `x` die Variable, die in Cypher mit der Node belegt wird und `X` der Name des Kurses.
Um Relations zu definieren wird folgende Notation verwendet, wobei wir davon ausgehen, dass `a` und `b` Kurse sind und Kurs `b` Inhalte aus `a` verwendet:

```cypher
CREATE (a)-[:USED_IN]->(b)
```

Um auf die Daten zuzugreifen werden Cypher [Queries](./Aufg2/cypher_queries.cypher) verwendet.
Um herauszufinden, welche Module für NoSQL/BigData nützlich sind, haben wir folgende Query verwendet:

```cypher
MATCH (c1:Course)-[:USED_IN]->(c2:Course) WHERE c2.name = "NOSQL" RETURN c1
```

Um herauszufinden, welche Module bisher im Studium nicht wieder genutzt wurden haben wir folgende Queries verwendet:

```cypher
MATCH (c1:Course) WHERE NOT (c1)-[:USED_IN]->() RETURN c1
MATCH (c1:Course) WHERE NOT exists((c1)-[:USED_IN]->()) RETURN c1
```

Hierbei ist die zweite Query (laut des Neo4j-Browsers) anders als die erste nicht deprecated.

## Aufgabe 6

Daten [hier](http://nosqlzkn.ful.informatik.haw-hamburg.de/conceptnet.graph.db-v4.tar.gz)\
Daten in dem docker Container müssen zunächst entfernt werden.
Hierzu mit dem Befehl `docker exec -it neo4j-conceptnet /bin/bash` in den Container.
Dann mit dem Befehl `rm -rf /data/\*` alle Daten in data entfernen.
Die Daten werden mit dem Befehl `tar xf DATEI` entpackt.
Um die Daten zu importieren, müssen sie per `docker cp SOURCE_DIR CONTAINER_NAME:/data/` in die docker volume der neo4j Datenbank kopiert werden.
In dem Neo4j-Browser kann nun die entsprechende Datenbank ausgewählt werden. Eventuell muss der Docker-Container zunächst neu gestartet werden.\
Die Anfrage die gestellt werden muss ist:

```cypher
MATCH (n {id: "/c/en/baseball"})-[r:IsA]-(res) RETURN res
```

Das Ergebnis dieser ist [hier](./Aufg2/result_aufg6.txt) zu finden.
