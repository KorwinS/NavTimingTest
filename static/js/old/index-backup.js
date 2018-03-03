
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
            complete: ''
        },
        debug = (window.location.search.indexOf('debug=true') > -1) || false;

    window.debug = debug;

    if (window.debug) {
        console.log('Performance timing:');
        console.log(metrics.timing);
    }

    metrics.complete = getDomContentLoaded(metrics.timing.performance);

    // Send Data to timing API
    axios.post('/timing', {
        data: metrics.timing
    })
    .then(function (response) {
        // console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });


    // Check performance support
    if (window.performance === undefined) {
      log("= Calculate Load Times: performance NOT supported");
      return;
    }

    // Get a list of "resource" performance entries
    var resources = window.performance.getEntriesByType("resource");
    if (resources === undefined || resources.length <= 0) {
      console.log("= Calculate Load Times: there are NO `resource` performance records");
      return;
    }
    for (var i=0; i < resources.length; i++) {
        var now = new Date(),
            perfMetrics = {
                ts: now.getTime(),
                name:resources[i].name,
                redirectTime: resources[i].redirectEnd - resources[i].redirectStart,
                dnsTime: resources[i].domainLookupEnd - resources[i].domainLookupStart,
                tcpTime:resources[i].connectEnd - resources[i].connectStart,
                secureTime:(resources[i].secureConnectionStart > 0) ? (resources[i].connectEnd - resources[i].secureConnectionStart) : "0",
                respTime:resources[i].responseEnd - resources[i].responseStart,
                fetchUntilEnd:(resources[i].fetchStart > 0) ? (resources[i].responseEnd - resources[i].fetchStart) : "0",
                requesStartToEnd:(resources[i].requestStart > 0) ? (resources[i].responseEnd - resources[i].requestStart) : "0",
                startUntilRespEnd:(resources[i].startTime > 0) ? (resources[i].responseEnd - resources[i].startTime) : "0"
        };
        // Send Resource data to API
        axios.post('/resource', {
            data: perfMetrics
        })
        .then(function (response) {
            // console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
        }

    return metrics;
}

if (window.addEventListener) {
    window.addEventListener('load', getMetrics);
} else {
    window.attachEvent('onload', getMetrics);
}
