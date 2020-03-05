import { getOwner } from '@ember/application';
import Service from '@ember/service';
import EmberObject, { computed } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-wikipedia-slug-plugin
 * @class RdfaEditorRelatedUrlPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorRelatedUrlPlugin = Service.extend({

  init(){
    this._super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
  },

  /**
   * task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    const cards = [];

    for( const context of contexts ){
      // remove earlier hints
      hintsRegistry.removeHintsInRegion( context.region, hrId, this.who );

      // add hints for context
      const test = /dbp:([A-z])/g;
      let match;

      while( match = test.exec( context.text ) ) {
        const matchText = match[0];
        const location = this.normalizeLocation(
          [ match.index, match.index + match[0].length ],
          context.region );

        cards.push( {
          info: {
            label: this.get('who'),
            plainValue: matchText,
            location,
            hrId, hintsRegistry, editor
          },
          location: location,
          card: this.get('who')
        } );
      }
    }
    if(cards.length > 0) {
      // We add the new cards to the hint registry
      hintsRegistry.addHints(hrId, this.get('who'), cards);
    }
    yield 1
  }),

  /**
   * Maps location of substring back within reference location
   *
   * @method normalizeLocation
   *
   * @param {[int,int]} [start, end] Location withing string
   * @param {[int,int]} [start, end] reference location
   *
   * @return {[int,int]} [start, end] absolute location
   *
   * @private
   */
  normalizeLocation(location, reference) {
    return [location[0] + reference[0], location[1] + reference[0]];
  },

});

RdfaEditorRelatedUrlPlugin.reopen({
  who: 'editor-plugins/wikipedia-slug-card'
});
export default RdfaEditorRelatedUrlPlugin;
