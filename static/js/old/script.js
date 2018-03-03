window.onload = function () {
    var emc = window.performance.timing;
    var perfData = emc.domContentLoadedEventEnd - emc.domainLookupStart;

    axios.post('/timing', {
        data: perfData
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
}

// ttfb, visually ready, fully loaded (without live engage and foresee),
