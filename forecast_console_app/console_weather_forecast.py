import requests
from bing_maps_api_key import bing_maps_api_key

def get_lat_lon(city, state):
    """
    input: city name, state postal code
    output: latitude, longitude
    Get the latitude and longitude for a certain city in the united states to get its weather data
    """

    #Get the api key
    bing_maps_key = bing_maps_api_key

    #Construct the API URL with city, state, and api key
    url = f"http://dev.virtualearth.net/REST/v1/Locations/US/{state}/{city}/?output=json&key={bing_maps_key}"
    
    #Send a GET request to the API URL
    response = requests.get(url)

    #If the response is successful extract latitude and longitude data
    if response.ok:
        lat = response.json()['resourceSets'][0]['resources'][0]['geocodePoints'][0]['coordinates'][0]
        lon = response.json()['resourceSets'][0]['resources'][0]['geocodePoints'][0]['coordinates'][1]
        return lat, lon
    
    #If the response is unsuccesful raise an exception
    else:
        raise Exception('Failed to get latitude and longitude')

def get_office_id(lat, lon):
    """
    input: latitude, longitude
    output: NWS office name, NWS gridpoints X and Y, city name, state name
    Get the NWS office information for a certain latitude and longitude in the United States
    """
    # Construct the API URL for the given latitude and longitude
    url = f'https://api.weather.gov/points/{lat},{lon}'

    # Send a GET request to the API URL
    response = requests.get(url)

    # If the response is successful, extract the office data
    if response.ok:
        office = str(response.json()['properties']['gridId'])
        gridX = response.json()['properties']['gridX']
        gridY = response.json()['properties']['gridY']
        city = response.json()['properties']['relativeLocation']['properties']['city']
        state = response.json()['properties']['relativeLocation']['properties']['state']
        return office, gridX, gridY, city, state

    # If the response is not successful, raise an exception
    else:
        raise Exception('Failed to fetch office information.')
    
def get_forecast(office, gridX, gridY):
    """
    input: NWS office name, NWS gridpoints X and Y
    output: current forecast data and upcoming forecast data in a string
    Get the current and upcoming forecast for the specified location in the United States
    """

    # Construct the API URL for the given NWS office information
    url = f'https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}/forecast'

    #Send a GET request to the API URL
    response = requests.get(url)

    #If the response is successful, get forecast data
    if response.ok:
        forecast = "\t"+response.json()['properties']['periods'][0]['name']
        forecast += " - "+response.json()['properties']['periods'][0]['detailedForecast']
        forecast += "\n\t"+response.json()['properties']['periods'][1]['name']
        forecast += " - "+response.json()['properties']['periods'][1]['detailedForecast']

        return forecast

    #If the response is not successful, raise an exception
    else:
        raise Exception('Failed to fetch forecast.')

def get_coordinate(coordinate):
    """
    input: string value of the type of coordinate you are asking the user for
    output: float coordinate value
    Ask the user for a coordinate value and ensure the input can be and is used as a float
    """
    while True:
        try:
            coordinate_value = float(input(f"{coordinate.title()}: "))
        except ValueError:
            print(f"Please enter a float value for the {coordinate.lower()}.")
        else:
            return coordinate_value
        
def get_city():
    """
    input: none
    output: string of a city name specified by the user
    Get a name of a city from the user
    """
    city = str(input("City Name: "))
    return city

def get_state():
    """
    input: none
    output: string of a state postal code specified by the user
    Get the postal code of a state from the user
    """
    state = str(input("Postal Code of State: "))
    return state

def main():
    """
    input: none
    output: none
    Ask the user for a city name and state postal and print out the current and upcoming forecast for the city
    Using rest api's through NWS and Bing Maps
    """
    #Instruct the user and ask for city and state information
    print("Please enter the city and state from which you want to see the weather forecast.")
    city = get_city()
    state = get_state()

    #Get the latitude and longitude
    lat, lon = get_lat_lon(city, state)

    #Get the NWS office information
    office, gridX, gridY, city, state = get_office_id(lat, lon)

    #Get the forecast data.  If it can't be retrieved in three tries stop trying
    x = 0
    while x < 3:
        try:
            forecast = get_forecast(office, gridX, gridY)
        except:
            if x < 2:
                print("Couldn't receive data trying again.")
                x+=1
            else:
                print("Couldn't receive data.  Try entering another location.")
                x+=1
        else:
            break
    
    #Display the forecast information to the user
    print(f"The current forecast for {city}, {state} is:")
    print(forecast)

main()