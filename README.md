# Navigation Timing Test
This is an app to test out using the browser navigation timing API, and sending the data to an API Endpoint.

The API is a small flask app. I was running it using a virtualenv with flask installed.

### Setup
Virtual environment: Go to your project directory and run `virtualenv navtest`. Then use virtual environment's pip to install flask`navtest/bin/pip install flask`.

From the project directory, run `navtest/bin/python app.py` to start the flask app.

Go to localhost:5000/ in a browser. On page load, the downloadJSAtOnload function loads navtiming.js, which collects the timing api data and sends it to the /timing endpoint of the flask api. This will parse the data and do the calculations to report on timing metrics that we care about. These metrics are formatted into the proper syntax for a call to the HTTPListener plugin for Telegraf. Telegraf then parses the input and stores the metrics in InfluxDB.


### To Do
* Move this off my computer to AOW server
* Work on setting this up in OnCalltest/beta (Jarvis App that I can mess with)
* Set this up on QL.com Beta
