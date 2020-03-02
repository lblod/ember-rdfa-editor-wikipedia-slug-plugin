import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/related-url-card';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-related-url-plugin
* @class RelatedUrlCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),
  options: [],

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),
  getDbpediaOptions() {
    const termCapitalized = this.capitalizeFirstLetter(this.info.plainValue)
    const url = new URL("http://dbpedia.org/sparql")
    let query = `
      SELECT ?label ?matchScore WHERE {
        ?s rdfs:label ?label.
        ?s a owl:Thing.
        ?label bif:contains '${termCapitalized}'
        OPTION (score ?sc)
        FILTER (lang(?label) = 'en')
        BIND(IF (?label = '${termCapitalized}'@en, ?sc + 100, ?sc) AS ?matchScore)
      }ORDER BY DESC (?matchScore)
    `
    const params = {
      format: "application/sparql-results+json",
      query,
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        this.set('options', json.results.bindings.map((option) => option.label.value))
      })
  },
  capitalizeFirstLetter(word) {
    word.charAt(0).toUpperCase() + word.substring(1);
  },
  willRender() {
    this.getDbpediaOptions()
  },

  generateLink() {
    return `
      <a href='https://en.wikipedia.org/wiki/${encodeURI(this.options[0])}' property='rdf:seeAlso'>
        ${this.options[0]}
      </a>
    `
  },
  actions: {
    insert(){
      this.get('hintsRegistry').removeHintsAtLocation(this.get('location'), this.get('hrId'), 'editor-plugins/related-url-card');
      const linkHTML = this.generateLink()
      const selection = this.get('editor').selectHighlight(this.get('location'))
      this.get('editor').update(selection, { set: {innerHTML: linkHTML}})
    }
  }
});
