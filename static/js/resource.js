function calculate_load_times() {
  // Check performance support
  if (performance === undefined) {
    log("= Calculate Load Times: performance NOT supported");
    return;
  }

  // Get a list of "resource" performance entries
  var resources = performance.getEntriesByType("resource");
  if (resources === undefined || resources.length <= 0) {
    console.log("= Calculate Load Times: there are NO `resource` performance records");
    return;
  }
  for (var i=0; i < resources.length; i++) {
      var perfMetrics = {
          name:'',
          redirectTime: 0,
          dnsTime: 0,
          tcpTime:0,
          secureTime:0,
          respTime:0,
          fetchUntilEnd:0,
          requesStartToEnd:0,
          startUntilRespEnd:0
      };
      perfMetrics['name'] = resources[i].name;
    // Redirect time
    var t = resources[i].redirectEnd - resources[i].redirectStart;
    perfMetrics['redirectTime'] = t

    // DNS time
    t = resources[i].domainLookupEnd - resources[i].domainLookupStart;
    perfMetrics['dnsTime'] = t

    // TCP handshake time
    t = resources[i].connectEnd - resources[i].connectStart;
    perfMetrics['tcpTime'] = t

    // Secure connection time
    t = (resources[i].secureConnectionStart > 0) ? (resources[i].connectEnd - resources[i].secureConnectionStart) : "0";
    perfMetrics['secureTime'] = t

    // Response time
    t = resources[i].responseEnd - resources[i].responseStart;
    perfMetrics['respTime'] = t

    // Fetch until response end
    t = (resources[i].fetchStart > 0) ? (resources[i].responseEnd - resources[i].fetchStart) : "0";
    perfMetrics['fetchUntilEnd'] = t

    // Request start until reponse end
    t = (resources[i].requestStart > 0) ? (resources[i].responseEnd - resources[i].requestStart) : "0";
    perfMetrics['requesStartToEnd'] = t

    // Start until reponse end
    t = (resources[i].startTime > 0) ? (resources[i].responseEnd - resources[i].startTime) : "0";
    perfMetrics['startUntilRespEnd'] = t

    console.log(perfMetrics)

  }
}
