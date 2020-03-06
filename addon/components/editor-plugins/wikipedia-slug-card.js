import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/wikipedia-slug-card';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-wikipedia-slug-plugin
* @class RelatedUrlCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  @action
  /**
   * Replaces the highlighted word by the html link
   * @method insert
   * @public
   */
  insert() {
    this.info.hintsRegistry.removeHintsAtLocation(this.info.location, this.info.hrId, 'editor-plugins/wikipedia-slug-card');
    const linkHTML = this.generateLink();

    //TODO:
    // Select and replace the word highlighted by the linkHTML.
    // You should use this.editor.selectHighlight and supply this.info.location as the first argument
    // See: https://dev.say-editor.com/code/classes/Select.html
    // Next, use this.editor.update to insert the link
    // See: (https://dev.say-editor.com/code/classes/Update.html#method_update
  },

  /**
   * Generate the html Element containing the link to the wikipedia article
   * @method generateLink
   * @return String
   * @public
   */
  generateLink() {
    return `
      <a href='https://en.wikipedia.org/wiki/${encodeURI(this.options[0])}' property='rdf:seeAlso'>
        ${this.options[0]}
      </a>&nbsp;
    `;
  },

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

  /**
   * Get all the dbpedia options related to the term of the card,
   * and store them in this.options
   * @method getDbpediaOptions
   * @public
   */
  getDbpediaOptions: task(function *() {
    const termCapitalized = this.capitalizeFirstLetter(this.info.plainValue);
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

    const response = yield fetch(url);
    const json = yield response.json();
    this.set('options', json.results.bindings.map((option) => option.label.value));
  }),

  /**
   * Capitalize the first letter of a string
   * @method capitalizeFirstLetter
   * @return String
   * @public
   */
  capitalizeFirstLetter(word) {
    return (word.charAt(0).toUpperCase() + word.substring(1));
  },

  /**
   * Runs just before the card appears on the screen, it fetchs the dbpedia
   * in order to show options
   * @method willRender
   * @public
   */
  willRender() {
    if(!this.options.length) {
      this.getDbpediaOptions.perform();
    }
  }
});
