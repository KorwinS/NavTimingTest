from flask import Flask, render_template, request, json, jsonify
import requests
from logging.handlers import RotatingFileHandler

app = Flask(__name__)

@app.route("/navtest")
def hello():
    """ Provides a test page that is instrumented with js timing lib """
    return render_template('index.html')

# Telegraf HTTP Listener (Influx line protocol) syntax:
# Metric         |Tags                        |Value     |Timestamp
# cpu_load_short,host=server01,region=us-west value=0.64 1434055562000000000'

@app.route('/timing', methods=['POST'])
def dump_timing():
    """ Submits timing data from webpage to influxdb """
    # Get the json from the POST
    timing = request.get_json(request.data)

    perf = timing['data']['perfData']
    ts = timing['data']['perfData']['ts'] # Timestamp
    met_host = timing['data']['location']['host'] # Hostname
    met_url = timing['data']['location']['pathname'] # URL

    # Calculate Time to first byte
    ttfb = perf['responseStart'] - perf['fetchStart']

    # URL for Telegraf HTTP Listener
    url = 'http://localhost:8186/write'

    # Build the timing metrics dictionary
    timing_dict = {
        'ttfb':ttfb,
        'appcacheTime':perf['appcacheTime'],
        'connectTime':perf['connectTime'],
        'domReadyTime':perf['domReadyTime'],
        'initDomTreeTime':perf['initDomTreeTime'],
        'loadEventTime':perf['loadEventTime'],
        'loadTime':perf['loadTime'],
        'lookupDomainTime':perf['lookupDomainTime'],
        }
    if timing['data']['firstPaintTime'] < 0:
        timing_dict['firstPaintTime']=0
    else:
        timing_dict['firstPaintTime']=timing['data']['firstPaintTime']
    #
    # Loop through the Timing Data
    for key, value in timing_dict.iteritems():
        data = 'newNavTiming_%s,host=%s,url=%s value=%d %d000000' % (key, met_host, met_url, value, ts)
        r = requests.post(url, data=data, headers={'Content-Type': 'application/octet-stream'})

    # Get Resource Data
    res = timing['data']['resource']

    # Loop through the resource data
    x=0
    while x < len(res):
        # Calculate resource performance times
        for value in res[str(x)].iteritems():
            res_name = res[str(x)]['name']
            res_dns = res[str(x)]['domainLookupEnd'] - res[str(x)]['domainLookupStart']
            res_connection = res[str(x)]['connectEnd'] - res[str(x)]['connectStart']
            res_requestTime = res[str(x)]['responseEnd'] - res[str(x)]['requestStart']
            res_fetchTime = res[str(x)]['responseEnd'] - res[str(x)]['fetchStart']

            # Build the request metric dictionary
            res_dict = {
                'res_dns':res_dns,
                'res_connection':res_connection,
                'res_requestTime':res_requestTime,
                'res_fetchTime':res_fetchTime
                }

        # Loop through the results and send the metrics to Telegraf
        for key, value in res_dict.iteritems():
            data = 'restiming_%s,name=%s value=%d %d000000' % (key, res_name, value, ts)
            r = requests.post(url, data=data, headers={'Content-Type': 'application/octet-stream'})
        x=x+1
    return 'ok'

if __name__ == "__main__":
    app.run(host='localhost', debug=True) # Change host to host='0.0.0.0' to access external
