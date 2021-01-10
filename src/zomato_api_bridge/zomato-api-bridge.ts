import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import camelCaseKeys from 'camelcase-keys';
import { config } from './api-config';

const ACCESS_KEY = config.ACCESS_KEY;
const API_URL = config.API_URL;

const maxEstablishments = 10;
const DEFAULT_REGION_ID = 279; // Seattle

export class ZomatoAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = API_URL;
    }

    willSendRequest(request: RequestOptions) {
        request.headers.set('user-key', ACCESS_KEY);
    }

    /**
     * Get a list of 20 restaurants (max) at a location
     * 
     * @param location The location searched for by the user
     */
    async searchForRestaurantsAtLocation(location: string) {
    
        // TODO: Error handling
        let locationRes = await this.get('locations', {
            query: location
        });

        let camelLocationRes = camelCaseKeys(locationRes, { deep: true });

        var regionId = DEFAULT_REGION_ID;
        if (camelLocationRes.locationSuggestions.length > 0) {
            regionId = camelLocationRes.locationSuggestions[0].entityId;
        }
    
        // TODO: Error handling
        let searchData = await this.get('search', {
            entity_id: regionId,
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

    /**
     * Get up to 10 of the available restaurant types at a location
     * 
     * @param location The location searched for by the user
     */
    async getEstablishmentsAtLocation(location: string) {
        let locationRes = await this.get('locations', {
            query: location
        });

        let camelLocationRes = camelCaseKeys(locationRes, { deep: true });

        var regionId = DEFAULT_REGION_ID;
        if (camelLocationRes.locationSuggestions.length > 0) {
            regionId = camelLocationRes.locationSuggestions[0].entityId;
        }

        let establishmentData = await this.get('establishments', {
            city_id: regionId
        });

        var establishments = [];
        for (var i = 0; i < establishmentData.establishments.length; i++) {
            let obj = establishmentData.establishments[i];
            let newEstablishment = {
                id: obj.establishment.id,
                name: obj.establishment.name
            }

            // Just grab 10 establishments for now
            if (establishments.length < maxEstablishments) {
                establishments.push(newEstablishment);
            }
        }

        return camelCaseKeys(establishments, { deep: true });
    }
}


export const dataSources = () => ({
    zomatoAPI: new ZomatoAPI()
});