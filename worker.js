onmessage = function(event) {
    const finalScore = event.data;
    postMessage(finalScore);
};
