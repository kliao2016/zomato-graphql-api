import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import camelCaseKeys from 'camelcase-keys';
import { config } from './api-config';

const ACCESS_KEY = config.ACCESS_KEY;
const API_URL = config.API_URL;

export class ZomatoAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = API_URL;
    }

    willSendRequest(request: RequestOptions) {
        request.headers.set('user-key', ACCESS_KEY);
    }

    async searchForRestaurantsAtLocation(location: string) {
    
        // TODO: Error handling
        let locationRes = await this.get('locations', {
            query: location
        });

        let camelLocationRes = camelCaseKeys(locationRes, { deep: true });

        var region = "Seattle";
        if (camelLocationRes.locationSuggestions.length > 0) {
            region = camelLocationRes.locationSuggestions[0].entityId;
        }
    
        // TODO: Error handling
        let searchData = await this.get('search', {
            entity_id: region,
            sort: "rating"
        });

        var restaurants = [];
        for (var i = 0; i < searchData.restaurants.length; i++) {
            let obj = searchData.restaurants[i];
            let newRestaurant = {
                id: obj.restaurant.R.res_id,
                name: obj.restaurant.name,
                address: obj.restaurant.location.address,
                locality: obj.restaurant.location.locality,
                cuisines: obj.restaurant.cuisines
            }
            restaurants.push(newRestaurant);
        }
        return camelCaseKeys(restaurants, { deep: true });
    }
}


export const dataSources = () => ({
    zomatoAPI: new ZomatoAPI()
});