# NoSQL Praktikum Semester 6

## Aufgabe 1-3

Dokumentation siehe Ordner Aufg1

## Aufgabe 4

siehe https://github.com/BennyOe/S6NoSQL

## Aufgabe 5

[Skript](./Aufg2/courses)\
Im ersten Teil des Skriptes werden alle bisherigen besuchten Kurse als Knoten hinzugefügt.
Dies geschieht mit Hilfe folgender Notation:

```
CREATE (x:Course {name: "X"})
```

Hierbei ist `x` die Variable, die in Cypher mit der Node belegt wird und `X` der Name des Kurses.
Um Relations zu definieren wird folgende Notation verwendet, wobei wir davon ausgehen, dass `a` und `b` Kurse sind und Kurs `b` Inhalte aus `a` verwendet:

```
CREATE (a)-[:USED_IN]->(b)
```

## Aufgabe 6

Um die Daten zu importieren, müssen sie per `docker cp SOURCE_DIR CONTAINER_NAME:/data/` in die docker volume der neo4j Datenbank kopiert werden.
In dem Neo4j-Browser kann nun die entsprechende Datenbank ausgewählt werden. Eventuell muss der Docker-Container zunächst neu gestartet werden.\
Die Anfrage die gestellt werden muss ist:

```
MATCH (n {id: "/c/en/baseball"})-[r:IsA]-(res) RETURN res
```

Das Ergebnis dieser ist [hier](./Aufg2/result_aufg6.txt) zu finden.
