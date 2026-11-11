/* Keep the first wrong attempt on the same open math question, before history and score hooks. */
(function(){
  'use strict';
  const submitPrevious = submitAnswer;
  submitAnswer = async function(value) {
    if (currentScreen === 'game' && phase === 'answer' && pending &&
        window.rrAbilityEngine?.allowSecondChance?.(turn, value, pending.q?.[1])) return;
    return submitPrevious(value);
  };
})();
