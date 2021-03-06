import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency';

const EDITOR_CARD_NAME = 'editor-plugins/wikipedia-slug-card';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-wikipedia-slug-plugin
 * @class RdfaEditorRelatedUrlPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorRelatedUrlPlugin = Service.extend({

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
    console.log("Hello");

    const cards = [];

    for( const context of contexts ){
      // remove earlier hints

      hintsRegistry.removeHintsInRegion( context.region, hrId, EDITOR_CARD_NAME ); // MARK

      // add hints for context
      const test = /dbp:([a-zA-Z]+)/g;
      let match = context.text.match(test);
      if(match) {
        const matchedString = match[0];
        const matchedTerm = matchedString.split(':')[1];
        const matchIndex = context.text.indexOf(matchedString);
        const location = this.normalizeLocation(
          [ matchIndex, matchIndex + matchedString.length ],
          context.region );  // MARK?

        cards.push( EmberObject.create({
          info: {
            label: "Our wikipedia insertion",
            plainValue: matchedTerm,
            location,
            hrId, hintsRegistry, editor
          },
          location: location,
          card: EDITOR_CARD_NAME
        }) );
      }
    }

    hintsRegistry.addHints(hrId, EDITOR_CARD_NAME, cards); // MARK
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

export default RdfaEditorRelatedUrlPlugin;
