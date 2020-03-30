import Service from '@ember/service';

import normalizeLocation from '../utils/normalize-location';

const COMPONENT_ID = 'editor-plugins/wikipedia-slug-card';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-wikipedia-slug-plugin
 * @class RdfaEditorRelatedUrlPlugin
 * @constructor
 * @extends EmberService
 */
export default class RdfaEditorDbpediaPluginService extends Service {
  /**
   * Handles the incoming events from the editor dispatcher.
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
  execute(hrId, rdfaBlocks, hintsRegistry, editor){
    const hints = [];
    for( const rdfaBlock of rdfaBlocks ) {
      // using the removal here requires us to add hints in a separate loop.
      hintsRegistry.removeHintsInRegion(rdfaBlock.region, hrId, COMPONENT_ID);


      if (this.patternMatch( rdfaBlock )) {
        const match = this.patternMatch( rdfaBlock );
        const matchedString = match[0];
        const matchedTerm = matchedString.split(':')[1];
        const matchIndex = rdfaBlock.text.indexOf(matchedString);
        const location = normalizeLocation(
          [ matchIndex, matchIndex + matchedString.length ],
          rdfaBlock.region );

        hints.pushObject( {
          info: {
            label: "Our wikipedia insertion",
            term: matchedTerm,
            location,
            hrId, hintsRegistry, editor
          },
          location: location,
          card: COMPONENT_ID
        } );
      }
    }

    // adding hints must occur in a separate loop from removing hints
    hintsRegistry.addHints(hrId, COMPONENT_ID, hints);
  }

  /**
   * Given context object, detects if it matches the pattern dbp:*
   *
   * @method patternMatch
   *
   * @param {Object} rdfaBlock Context instance with an array of embedded contexts.
   * @return {boolean} Truethy if the text matches the pattern.
   *
   * @private
   */
  patternMatch(rdfaBlock) {
    return rdfaBlock.text.match(/dbp:([a-zA-Z_]+)/g);
  }

};
