//Welche Module sind für NoSQL/BigData nützlich?
MATCH (c1:Course)-[:USED_IN]->(c2:Course) WHERE c2.name = "NOSQL" RETURN c1
//Welche Module wurden bisher im Studium nicht wieder genutzt?
MATCH (c1:Course) WHERE NOT (c1)-[:USED_IN]->() RETURN c1
MATCH (c1:Course) WHERE NOT exists((c1)-[:USED_IN]->()) RETURN c1
