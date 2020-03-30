import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import dbpediaQuery from '../../util/dbpedia-query';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-wikipedia-slug-plugin
* @class RelatedUrlCard
* @extends Ember.Component
*/
export default class WikipediaSlugCardComponent extends Component {

  @tracked options = [];

  @tracked loading = false;

  constructor() {
    super(...arguments);
    this.getDbpediaOptions();
  }
   /**
   * Get all the dbpedia options related to the term of the card,
   * and store them in this.options
   * @method getDbpediaOptions
   * @public
   */
  async getDbpediaOptions() {
    this.loading = true;
    const options = await dbpediaQuery(this.args.info.term);
    this.options = options;
    this.loading = false;
  }

  /**
   * Replaces the highlighted word by the html link
   * @method insert
   * @public
   */
  @action
  insert() {
    this.args.info.hintsRegistry.removeHintsAtLocation(this.args.info.location, this.args.info.hrId, 'editor-plugins/wikipedia-slug-card');
    const linkHTML = this.generateLink();
    const selection = this.args.info.editor.selectHighlight(this.args.info.location);
    this.args.info.editor.update(selection, { set: { innerHTML: linkHTML } });
  }

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
  }
}
