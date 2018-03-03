/**
 * Timing.js 1.2.0
 * Copyright 2016 Addy Osmani
 */
(function(window) {
    'use strict';

    /**
     * Navigation Timing API helpers
     * timing.getTimes();
     **/
    window.timing = window.timing || {
        /**
         * Outputs extended measurements using Navigation Timing API
         * @param  Object opts Options (simple (bool) - opts out of full data view)
         * @return Object      measurements
         */
        getTimes: function(opts) {
            var now = new Date()
            var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

            if (performance === undefined) {
                return false;
            }

            var timing = performance.timing;
            var api = {
                perfData: {},
                resource: {},
                location: {
                    host: window.location.host,
                    href: window.location.href,
                    origin: window.location.origin,
                    pathname: window.location.pathname,
            }};
            opts = opts || {};

            if (timing) {
                if(opts && !opts.simple) {
                    for (var k in timing) {
                        // hasOwnProperty does not work because properties are
                        // added by modifying the object prototype
                        if(isNumeric(timing[k])) {
                            api.perfData[k] = parseFloat(timing[k]);
                        }
                    }
                }


                // Time to first paint
                if (api.firstPaint === undefined) {
                    // All times are relative times to the start time within the
                    // same objects
                    var firstPaint = 0;

                    // Chrome
                    if (window.chrome && window.chrome.loadTimes) {
                        // Convert to ms
                        firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
                        api.firstPaintTime = firstPaint - window.performance.timing.navigationStart;
                    }
                    // IE
                    else if (typeof window.performance.timing.msFirstPaint === 'number') {
                        firstPaint = window.performance.timing.msFirstPaint;
                        api.firstPaintTime = firstPaint - window.performance.timing.navigationStart;
                    }
                    // Firefox
                    // This will use the first times after MozAfterPaint fires
                    //else if (window.performance.timing.navigationStart && typeof InstallTrigger !== 'undefined') {
                    //    api.firstPaint = window.performance.timing.navigationStart;
                    //    api.firstPaintTime = mozFirstPaintTime - window.performance.timing.navigationStart;
                    //}
                    if (opts && !opts.simple) {
                        api.firstPaint = firstPaint;
                    }
                }

                // Total time from start to load
                api.perfData.loadTime = timing.loadEventEnd - timing.fetchStart;
                // Time spent constructing the DOM tree
                api.perfData.domReadyTime = timing.domComplete - timing.domInteractive;
                // Time consumed preparing the new page
                api.perfData.readyStart = timing.fetchStart - timing.navigationStart;
                // Time spent during redirection
                api.perfData.redirectTime = timing.redirectEnd - timing.redirectStart;
                // AppCache
                api.perfData.appcacheTime = timing.domainLookupStart - timing.fetchStart;
                // Time spent unloading documents
                api.perfData.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
                // DNS query time
                api.perfData.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
                // TCP connection time
                api.perfData.connectTime = timing.connectEnd - timing.connectStart;
                // Time spent during the request
                api.perfData.requestTime = timing.responseEnd - timing.requestStart;
                // Request to completion of the DOM loading
                api.perfData.initDomTreeTime = timing.domInteractive - timing.responseEnd;
                // Load event time
                api.perfData.loadEventTime = timing.loadEventEnd - timing.loadEventStart;
                // Timestamp
                api.perfData.ts = now.getTime()

                //Resource Timing
                var resources = window.performance.getEntriesByType("resource");
                if (resources === undefined || resources.length <= 0) {
                  console.log("= Calculate Load Times: there are NO `resource` performance records");
                  return;
                }
                for (var i=0; i < resources.length; i++) {
                    var newObj = {};
                    newObj[i] = resources[i]
                    api.resource[i] = newObj[i]
                };

            }

            return api;
        },
    };

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Expose as a commonjs module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.timing;
    }

})(typeof window !== 'undefined' ? window : {});


function testMetrics(metrics) {
    axios.post('/timing', {
        data: metrics
    })
    .then(function (response) {
        // console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
    // console.log(testMetrics())
}

window.addEventListener ?
    window.addEventListener("load",testMetrics(timing.getTimes()),false)
    :
    window.attachEvent && window.attachEvent("onload",testMetrics(timing.getTimes()));
