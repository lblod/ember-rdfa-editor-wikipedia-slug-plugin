import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import dbpediaQuery from '../../utils/dbpedia-query';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-wikipedia-slug-plugin
* @class RelatedUrlCard
* @extends Glimmer.Component
*/
export default class WikipediaSlugCardComponent extends Component {

  /**
   * Best solution found by searching dbpedia.
   *
   * @property solution
   * @type {String}
   */
  @tracked solution = null;

  /**
   * Toggled to true when we are in a loading state.
   *
   * @property loading
   * @type {boolean}
   */
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
    const solutions = await dbpediaQuery(this.args.info.term);
    this.solution = solutions.length ? solutions[0] : 0;
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
    const url = `https://en.wikipedia.org/wiki/${encodeURI(this.solution)}`;
    const label = this.solution;
    const linkHTML = `<a href="${url}" property="rdf:seeAlso">${label}</a>&nbsp;`;

    const selection = this.args.info.editor.selectHighlight(this.args.info.location);
    this.args.info.editor.update(selection, { set: { innerHTML: linkHTML } });
  }
}
