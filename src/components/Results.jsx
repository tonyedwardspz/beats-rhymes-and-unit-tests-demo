import { forwardRef } from 'react';

const Results = forwardRef(function Results(
  { finalTranscript, interimTranscript },
  finalRef
) {
  return (
    <div id="results">
      <span id="final_span" className="final" ref={finalRef}>
        {finalTranscript}
      </span>
      <span id="interim_span" className="interim">
        {interimTranscript}
      </span>
    </div>
  );
});

export default Results;
