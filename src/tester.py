import requests as r 
from pprint import pprint

data = {}
data['name'] = "testjob"
data['taskScript'] = "timerCallback"
data['scheduleDate'] = "2023-04-13 19:18"
data['runImmediately'] = False
data['callbackURL'] = 'http://google.com'
data['data'] = '{"delayMilliseconds":10000}'


# result = r.get('http://localhost:3000/jobs/types')
result = r.post('http://localhost:3000/jobs', data=data)
print("RESULT")
pprint(result.text)