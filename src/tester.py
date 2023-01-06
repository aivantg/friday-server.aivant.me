import requests as r 
from pprint import pprint

data = {}
headers = {}
data['name'] = "testjob23"
data['taskScript'] = "southwestCheckin"
# data['scheduleDate'] = "2022-12-22 5:54"
# data['callbackURL'] = 'http://google.com'
data['data'] = '{"confirmationNumber":"23LM4Q", "firstName": "Aivant", "lastName":"Goyal", "phoneNumber":"9134390901"}'
data['secret'] = 'password'

# headers['cookie'] = 'swa_FPID=53c1d7c7-aaab-4187-b139-614f40b5474e; at_check=true; AMCVS_65D316D751E563EC0A490D4C%40AdobeOrg=1; s_ecid=MCMID%7C88358159023755391820791560898521075847; sRpK8nqm_sc=AyVrHUGFAQAArQ8fzzR5diw_gl-jzsIc48INCX_VMs9a5z9NcNyNMeA7bDGUAYglvh6ucmW8wH8AAOfvAAAAAA|1|1|5bb4213de86155b15627ca5bd9156df77d803d8e; s_cc=true; nmstat=7bc53b36-7be6-8e31-3a7b-0c52759b9fd2; _mibhv=anon-1612247292843-3686816549_4971; akavpau_prd_air_check_in=1671835392~id=17023c11dcb6b3aa9706b32b1d45bfa1; s_fid=3EADB59359B08B2F-37171DE8136B6091; QSI_SI_7QCB4wqvzVy7VcO_intercept=true; AMCV_65D316D751E563EC0A490D4C%40AdobeOrg=1176715910%7CMCIDTS%7C19350%7CMCMID%7C88358159023755391820791560898521075847%7CMCAAMLH-1672449350%7C7%7CMCAAMB-1672449350%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1671851750s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C5.4.0; akavpau_prd_non_vision=1671845150~id=08564e8663b5db98b9527bb2eccd73e2; weiygrety=C5sgBEyX; sRpK_XA_swc=%7B%22c%22%3A%22OXhWZEk2NXg5ZU9lc0ZkTQ%3D%3D9yEr_p2g31sN_v8cyppsOkCUEf0l3tT6OTAxqr1YADknN5Q9B9LDg_gDktJpiW48lf1G4ep9TtzY94h1gtznrW2AuOh1UKNNpB7bsOlJSj_trV-U7EXJ7p09YGTJ_2f3LYw%3D%22%2C%22dc%22%3A%22000%22%2C%22mf%22%3A0%2C%22_fr%22%3A20000%2C%22fr%22%3A%224KeM7YAQvBdZWjSFR_ZqmA%3D%3DdNtoqct96dj7srsmBK4QEKS4n_RW9J5aRW1ZkYgO5Rx4UAjoze_yMGRu-JZqHMSsr0EbVc8Xrc6e8mAkMeEHzbQ8y7rm-22NYg6Qg2op18rbxoE%3D%22%2C%22ct%22%3A%22N0xqfP9dvTHN%2FDf8tmCks8VRCf2U7B2k0HQP80k%3D%22%7D; akavpau_prd_air_manage_reservation=1671845216~id=713013730add77b18ede20c1f9905205; mbox=PC#a14e1d152abf42bf9e9eacf425186d90.35_0#1735089418|session#7e6ab965331b4fd48627e69566f8f5da#1671846478; s_gpv_pn=RETRIEVE%3ATRIP%3AEnter%20Air%20Locator; RT="z=1&dm=southwest.com&si=59f00185-67cb-4246-ad9f-bc7521931fe3&ss=lc192u5x&sl=3&tt=1z2&bcn=%2F%2F17de4c0d.akstat.io%2F&ld=1o3n"; s_sq=swaprod%3D%2526c.%2526a.%2526activitymap.%2526page%253DRETRIEVE%25253ATRIP%25253AEnter%252520Air%252520Locator%2526link%253DSearch%2526region%253Dswa-content%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c'
# headers['accept'] = 'application/json, text/javascript, */*; q=0.01'
# headers['accept-encoding'] = 'gzip, deflate, br'
# headers['authorization'] = 'null null'
# headers['content-type'] = 'application/json'
# headers['origin'] = 'https://www.southwest.com'
# headers['referrer'] = 'https://www.southwest.com/air/manage-reservation/index.html'
# headers['x-api-key'] = 'l7xx944d175ea25f4b9c903a583ea82a1c4c'
# headers['x-app-id'] = 'air-manage-reservation'
# headers['x-api-idtoken'] = 'null'
# headers['x-channel-id'] = 'southwest'



# data['application'] = 'air-manage-reservation'
# data['confirmationNumber'] = '23LM4Q'
# data['passengerFirstName'] = 'Aivant'
# data['passengerLastName'] = 'Goyal'
# data['site'] = 'southwest'
# result = r.post('https://www.southwest.com/api/air-misc/v1/air-misc/page/air/manage-reservation/view', json=data, headers=headers)

# result = r.get('http://localhost:3000/jobs/')
result = r.post('http://localhost:3000/jobs', data=data)
print("RESULT")
pprint(result.text)