export default async function editorPluginsDbpediaQuery(term) {
  const termCapitalized = capitalizeFirstLetter(term);
  const url = new URL("http://dbpedia.org/sparql");
  let query = `
    SELECT ?label ?matchScore WHERE {
      ?s rdfs:label ?label.
      ?s a owl:Thing.
      ?label bif:contains '${termCapitalized}'
      OPTION (score ?sc)
      FILTER (lang(?label) = 'en')
      BIND(IF (?label = '${termCapitalized}'@en, ?sc + 100, ?sc) AS ?matchScore)
    }ORDER BY DESC (?matchScore)
  `;
  const params = {
    format: "application/sparql-results+json",
    query
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url);
  const json = await response.json();
  return json.results.bindings.map((option) => option.label.value)
}

function capitalizeFirstLetter(word) {
  return (word.charAt(0).toUpperCase() + word.substring(1));
}