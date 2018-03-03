
'use strict';

function getDomContentLoaded(perf) {
    var complete = perf.domComplete - perf.navigationStart;

    if (window.debug) {
        console.log(document.readyState);
        console.log(perf);
        console.log('Page load time: ' + complete + 'ms');
    }

    return complete;
}

function getMetrics() {
    var now = new Date(),
        metrics = {
            timing: {
                performance: ((window.performance && window.performance.timing) ? window.performance.timing : {}),
                location: {
                    hash: window.location.hash,
                    host: window.location.host,
                    href: window.location.href,
                    origin: window.location.origin,
                    pathname: window.location.pathname,
                    search: window.location.search
                },
                date: {
                    formatted: now,
                    ts: now.getTime()
                }
            },
            complete: '',
            resource: {}
        },
        debug = (window.location.search.indexOf('debug=true') > -1) || false;

    window.debug = debug;

    if (window.debug) {
        console.log('Performance timing:');
        console.log(metrics.timing);
    }

    metrics.complete = getDomContentLoaded(metrics.timing.performance);

    // Resource Timing
    var resources = window.performance.getEntriesByType("resource");
    if (resources === undefined || resources.length <= 0) {
      console.log("= Calculate Load Times: there are NO `resource` performance records");
      return;
    }
    for (var i=0; i < resources.length; i++) {
        var newObj = {};
        newObj[i] = resources[i]
        metrics.resource[i] = newObj[i]
    };

    return metrics;
}

if (window.addEventListener) {
    window.addEventListener('onload', getMetrics);
}
//else {
 //   window.attachEvent('onload', getMetrics);
//}

function testMetrics() {
    var data = getMetrics()
    return data;
}

axios.post('/timing', {
    data: testMetrics()
})
.then(function (response) {
    // console.log(response);
})
.catch(function (error) {
    console.log(error);
});
