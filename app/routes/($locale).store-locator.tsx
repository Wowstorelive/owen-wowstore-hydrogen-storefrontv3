import {useState, useEffect, useCallback, useMemo} from 'react';
// import groq from 'groq'; // TODO: Removed Sanity CMS - using custom CMS
import {json, type MetaArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData} from '@remix-run/react';
import {getPreciseDistance, orderByDistance} from 'geolib';
import {Image} from '@shopify/hydrogen';
import {
  GoogleMap as GoogleMapReact,
  useJsApiLoader,
  InfoWindowF,
  MarkerF,
} from '@react-google-maps/api';

import config from 'theme.config';
import {PageHeader} from '~/components/elements/Text';
import {
  DistanceIcon,
  LocationIcon,
  EmailIcon,
  PhoneIcon,
  WebIcon,
} from '~/components/elements/Icon';

import {seoPayload} from '~/lib/seo.server';
// import {
//   STORE_LOCATOR,
//   STORE_LOCATOR_SEARCH_BY_NAME,
// } from '~/data/sanity/pages/storeLocator'; // TODO: Removed Sanity CMS
import { useTranslation } from 'react-i18next';

const dataSelected = [
  {
    label: 'Store name',
    value: 'store-name',
  },
  {
    label: 'Location',
    value: 'location',
  },
  {
    label: 'Product name',
    value: 'product-name',
  },
];

export async function loader({request, context}: LoaderFunctionArgs) {
  // TODO: Replace with custom CMS integration
  // Sanity CMS removed - user has custom CMS system built on PostgreSQL
  // const sanityClient = context.sanity.client;
  // const query = groq`...`;
  // const page = await sanityClient.fetch(query);

  // Provide default data structure
  const page = {
    title: 'Store Locator',
    modules: [],
    seo: {
      title: 'Store Locator',
      description: 'Find our stores near you',
    },
  };

  const seo = seoPayload.page({page, url: request.url});
  const stores = null; // TODO: Load stores from PostgreSQL CMS

  return json({
    page,
    dataSelected,
    seo,
    sanityClient: null, // No Sanity client anymore
    stores,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function StoreLocator() {
  const {page, sanityClient, stores} = useLoaderData<typeof loader>();

  const {t} = useTranslation();
  const [currentLocator, setCurrentLocator] = useState<any>();
  const [selectedOptionSearch, setSelectedOptionSearch] = useState<string>(
    dataSelected[0].value,
  );
  const [miles, setMiles] = useState<any>('1');
  const [valueSearch, setValueSearch] = useState<string>('');
  const [dataSearch, setDataSearch] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [activeMarker, setActiveMarker] = useState(null);

  const [locationCenter, setLocationCenter] = useState({
    lat: stores ? parseFloat(stores[0].latitude) : 1,
    lng: stores ? parseFloat(stores[0].longitude) : 1,
  });

  const handleLocationCenter = (lat, lng) => {
    setLocationCenter({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  };

  const [permissionLocation, setPermissionLocation] = useState<string>();

  const searchTerm = async (e: any) => {
    e.preventDefault();
    const query = groq`
      *[_type == 'storeLocator'][0]{
        ${STORE_LOCATOR_SEARCH_BY_NAME(valueSearch)}
      }
    `;
    if (selectedOptionSearch == 'store-name') {
      const dataSearchStoreLocator = await sanityClient?.fetch(query);
      if (dataSearchStoreLocator.stores.length > 0) {
        setDataSearch(dataSearchStoreLocator.stores);
      } else {
        setDataSearch(null);
        setErrorMessage(t('There are no store'));
      }
    }

    if (selectedOptionSearch == 'location' && currentLocator) {
      const dataLocation = findNearestLocation(
        {lon: currentLocator.longitude, lat: currentLocator.latitude},
        stores,
        miles,
      );
      if (dataLocation) {
        setDataSearch([dataLocation]);
      } else {
        setDataSearch(null);
        setErrorMessage(t('locator.noStoreNearby'));
      }
    }
  };

  const toRadians = (degrees: number) => {
    return degrees * (Math.PI / 180);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radius: number,
  ) => {
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = radius * c;

    return distance;
  };

  const findNearestLocation = (
    currentLocation: any,
    locations: any,
    maxDistance: number,
  ) => {
    let nearestLocation;
    let shortestDistance = Infinity;

    // return findNearest({ latitude:currentLocation.lat, longitude: currentLocation.lon }, locations))

    for (const location of locations) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lon,
        location.latitude,
        location.longitude,
        maxDistance,
      );

      if (distance <= maxDistance && distance < shortestDistance) {
        shortestDistance = distance;
        nearestLocation = location;
      }
    }

    return nearestLocation;
  };

  const markerState = {
    activeMarker,
    setActiveMarker,
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const {latitude, longitude} = position.coords;

      const dataLocation = orderByDistance({latitude, longitude}, stores);
      const newDataLocation = dataLocation.map((item: any) => {
        item['distance'] = getPreciseDistance({latitude, longitude}, item);
        return item;
      });

      if (dataLocation && newDataLocation) {
        setDataSearch(newDataLocation);
        handleLocationCenter(
          dataLocation[0].latitude,
          dataLocation[0].longitude,
        );
      } else {
        setDataSearch(null);
      }
    });

    navigator.permissions.query({name: 'geolocation'}).then((result) => {
      setPermissionLocation(result.state);
    });
  }, []);

  useEffect(() => {
    if (permissionLocation === 'denied' || permissionLocation === 'prompt') {
      setDataSearch(stores);
      handleLocationCenter(stores[0].latitude, stores[0].longitude);
    }
  }, [permissionLocation]);

  useEffect(() => {
    if (dataSearch) {
      handleLocationCenter(dataSearch[0].latitude, dataSearch[0].longitude);
      setActiveMarker(dataSearch[0]._key);
    }
  }, [dataSearch]);

  return (
    <div className="container">
      {page?.showTitle === true && (
        <>
          <PageHeader
            heading={page?.title}
            className={page?.centerTitle ? 'justify-center' : ''}
          />
          <div className={`${page?.centerTitle ? 'text-center' : ''} mb-12`}>
            <p>{page?.seo?.description}</p>
          </div>
        </>
      )}

      <div className="border border-solid border-gray-300 rounded-md">
        <div className="p-3">
          <form
            action=""
            className="flex flex-col gap-3 lg:flex-row"
            onSubmit={(e) => searchTerm(e)}
          >
            <div className="flex flex-col gap-y-3 lg:w-1/3">
              <div>
                <div className="p-3 bg-gray-600">
                  <p className="font-bold text-white text-sm">
                    {t('locator.storeList')}{' '}
                    <span>
                      ({dataSearch ? dataSearch?.length : 0} results)
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-y-3 mt-4 h-[620px] pr-2 overflow-y-auto scroll-box">
                  {dataSearch &&
                    dataSearch?.map((item: any) => {
                      return (
                        <div
                          className="border border-solid border-gray-300 rounded-md"
                          key={item._key}
                          onClick={() =>
                            handleLocationCenter(
                              item.latitude,
                              item.longitude,
                            )
                          }
                          aria-hidden="true"
                        >
                          <div
                            className={`flex flex-col p-3 gap-y-3 cursor-pointer ${
                              activeMarker == item._key
                                ? 'bg-gray-300'
                                : 'null'
                            }`}
                            onClick={() => setActiveMarker(item._key)}
                            aria-hidden="true"
                          >
                            <div className="flex flex-col gap-y-2">
                              {item?.storeName && (
                                <p className="text-lg font-bold mb-2">
                                  {item?.storeName}
                                </p>
                              )}
                              
                              {item?.storeAddress && (
                                <div className="flex flex-row gap-x-2">
                                  <LocationIcon className="w-6 h-6" />
                                  <span>{item?.storeAddress}</span>
                                </div>
                              )}

                              {item?.storeEmail && (
                                <div className="flex flex-row gap-x-2">
                                  <EmailIcon className="w-6 h-6" />
                                  <span>{item?.storeEmail}</span>
                                </div>
                              )}

                              {item?.phoneNumber && (
                                <div className="flex flex-row gap-x-2">
                                  <span className="w-6 h-6 flex items-center justify-center">
                                    <PhoneIcon className="w-4 h-4" />
                                  </span>
                                  <span>{item?.phoneNumber}</span>
                                </div>
                              )}
                              
                              {item?.website && (
                                <div className="flex flex-row gap-x-2">
                                  <span className="w-6 h-6 flex items-center justify-center">
                                    <WebIcon className="w-4 h-4" />
                                  </span>
                                  <span>{item?.website}</span>
                                </div>
                              )}

                              {item?.distance && (
                                <div className="flex flex-row gap-x-2">
                                  <span>
                                    <DistanceIcon className="w-6 h-6" />
                                  </span>
                                  <span>{item.distance / 1000} km</span>
                                </div>
                              )}
                              
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {errorMessage ? <div>{errorMessage}</div> : null}
                </div>
              </div>
            </div>
            <div className="lg:w-2/3">
              {
                <GoogleMap
                  markerState={markerState}
                  handleLocationCenter={handleLocationCenter}
                  googleMap={{
                    height: '680px',
                    dataMarker: dataSearch ? dataSearch : '',
                    locationCenter,
                  }}
                />
              }
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function GoogleMap({
  googleMap,
  markerState,
  handleLocationCenter,
}: {
  googleMap: any;
  markerState: any;
  handleLocationCenter: any;
}) {
  const {dataMarker, locationCenter} = googleMap;
  const {setActiveMarker} = markerState;
  const { t } = useTranslation();

  if (config.googleMapKey == '') {
    return <p className="text-center py-12">{t('locator.needMapKey')}</p>;
  }

  const setCenterMap = (lat: number, lng: number) => {
    handleLocationCenter(lat, lng);
  };

  const center = {
    lat: parseFloat(locationCenter.lat),
    lng: parseFloat(locationCenter.lng),
  };

  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: config.googleMapKey,
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.setZoom(12);
    // map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <div style={{margin: googleMap?.margin}}>
      <div
        className="w-full"
        style={{height: googleMap?.height ? googleMap?.height : '50vh'}}
      >
        {isLoaded && dataMarker && (
          <GoogleMapReact
            mapContainerStyle={{
              height: '680px',
            }}
            center={center}
            onClick={() => setActiveMarker(null)}
            options={{
              zoom: 12,
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
            mapContainerClassName="map-container"
          >
            {dataMarker?.map((item: any) => {
              return (
                <Marker key={item._key} data={item} markerState={markerState} />
              );
            })}
          </GoogleMapReact>
        )}
      </div>
    </div>
  );
}

const Marker = (props: any) => {
  const {data, markerState} = props;
  const {activeMarker, setActiveMarker} = markerState;

  const position = useMemo(() => {
    return {
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
    };
  }, [data]);

  const handleActiveMarker = (marker: any) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  return (
    <MarkerF
      position={position}
      onClick={() => handleActiveMarker(data._key)}
      label={data?.storeName}
    >
      {data && activeMarker === data._key && (
        <InfoWindowF onCloseClick={() => setActiveMarker(null)} position={position}>
          <div className="flex flex-col gap-y-2 w-60 pl-1">
            <div className="rounded-md overflow-hidden">
              {data?.storeImage?.image?.url && (
                <div className="aspect-[3/2] overflow-hidden">
                  <Image
                    data={data?.storeImage?.image}
                    alt={data?.storeName}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
            </div>
            <div className="font-normal">
              <p className="text-base font-bold">{data?.storeName}</p>
              {data?.storeAddress && (
                <div className="flex flex-row gap-x-2 items-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    <LocationIcon className="w-5 h-5" />
                  </span>
                  <span>{data?.storeAddress}</span>
                </div>
              )}
              {data?.storeEmail && (
                <div className="flex flex-row gap-x-2 items-center">
                  <span>
                    <EmailIcon className="w-6 h-6" />
                  </span>
                  <span>{data?.storeEmail}</span>
                </div>
              )}
              {data?.phoneNumber && (
                <div className="flex flex-row gap-x-2 items-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4" />
                  </span>
                  <span>{data?.phoneNumber}</span>
                </div>
              )}
              {data?.website && (
                <div className="flex flex-row gap-x-2 items-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    <WebIcon className="w-4 h-4" />
                  </span>
                  <span>{data?.website}</span>
                </div>
              )}
              {data?.distance && (
                <div className="flex flex-row gap-x-2 items-center">
                  <span>
                    <DistanceIcon className="w-6 h-6" />
                  </span>
                  <span>{data?.distance / 1000} km</span>
                </div>
              )}
            </div>
          </div>
        </InfoWindowF>
      )}
    </MarkerF>
  );
};
