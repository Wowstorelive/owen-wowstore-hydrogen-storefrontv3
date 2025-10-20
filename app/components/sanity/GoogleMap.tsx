import {useRouteLoaderData} from '@remix-run/react';
import type {RootLoader} from '~/root';

export function GoogleMap({googleMap}: {googleMap: any}) {
  const {latitude, longitude, zoom} = googleMap;
  const {locale} = useRouteLoaderData<RootLoader>('root');

  const defaultProps = {
    center: {
      lat: Number(latitude) ? Number(latitude) : 21.029684,
      lng: Number(longitude) ? Number(longitude) : 105.775312,
    },
    zoom: Number(zoom) ? Number(zoom) : 13,
  };

  return (
    <div className="mb-12 md:mb-20" style={{margin: googleMap?.margin}}>
      <div className="w-full">
          <iframe
            src={`https://maps.google.com/maps?q=${defaultProps.center.lat},${defaultProps.center.lng}&hl=${locale}&z=${defaultProps.zoom}&amp&output=embed`}
            width="100%"
            height={googleMap?.height ? googleMap?.height : '450'}
            style={{border: 0}}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
      </div>
    </div>
  );
}
