import yelpapi
from yelpapi import YelpAPI
import json
import boto3
from decimal import Decimal
import requests
import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("yelp-restaurants")

region = 'us-east-1'
service = 'es'

host = 'https://search-restaurants-hjebambt3pukrd3q3ps7gxwoeu.us-east-1.es.amazonaws.com'

index = 'restaurants'
type = 'restaurant'

url = host + '/' + index + '/' + type + '/'

headers = { "Content-Type": "application/json" }

# # write private api_key to access yelp here
api_key = 'wCUL6ldYDFCLdS6l8rlouRdVHkSUxdroA9K0vTjxM6hElRtDHWaZBGIz-hTNqQ_HJkUb94Rux-ISpNoQmG7_XuWqI0Ah7RnIrHFKU8QuE68J_NKKweRODQX1U72EX3Yx'

yelp_api = YelpAPI(api_key)

data = ['id', 'name', 'review_count', 'rating', 'coordinates', 'display_address', 'zip_code', 'phone']
es_data = ['id']

cuisines = ["chinese", "indian", "mexican", "american", "italian"]
print(url)
def populate_database(response, cuisine):
    json_response = json.loads(json.dumps(response), parse_float=Decimal)
    for restaurant in json_response["businesses"]:
        dict = {'restaurant_id':restaurant['id']}
        dict['name'] = restaurant.get('name', '')
        dict['review_count'] = restaurant.get('review_count', 0) 
        dict['rating'] = restaurant.get('rating', 0) 
        dict['coordinates'] = restaurant.get('coordinates', {}) 
        dict['display_address'] = restaurant.get('location', '').get('display_address','')
        dict['zipcode'] = restaurant.get('location', '').get('zipcode','')
        dict['phone'] = restaurant.get('phone', '') 
        dict['cuisine'] = cuisine
        dict['insertedAtTimestamp'] = str(datetime.datetime.now())
        
        # print(dict)
        table.put_item(Item=dict)
        es_dict = {'restaurant_id': dict['restaurant_id'], 'cuisine':cuisine} 
        docs = json.loads(json.dumps(es_dict))
        
        r = requests.put(url+str(es_dict['restaurant_id']), json=docs, headers=headers)
        # print(r.text)
        
        

def lambda_handler(event=None, context=None):
    limit = 50
    for cuisine in cuisines:
        for x in range(0, 1000, 50):
            response = yelp_api.search_query(term=cuisine, location='Manhattan', limit=limit, offset=x)
            populate_database(response, cuisine)
