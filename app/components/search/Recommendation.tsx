import {Link, useParams} from "@remix-run/react";
import {useEffect, useState} from "react";
import {ProductCard} from "~/components/cards/ProductCard";
import {getImageLoadingPriority} from "~/lib/const";
import {Skeleton} from "~/components/elements/Skeleton";
import {IconSearch, IconCaret} from "~/components/elements/Icon";
import {useTranslation} from "react-i18next";
import {useRouteLoaderData} from '@remix-run/react';
import type {RootLoader} from '~/root';
import {useDirection} from '~/hooks/useDirection';

const Recommendation = (props: any) => {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const searchData = rootData?.sanityData?.settings[0]?.search ?? null;
  const {valueSearch} = props;
  const params = useParams();
  const [dataSearch, setDataSearch] = useState();
  const {t} = useTranslation();
  const dir = useDirection();
  const direction = dir === 'ltr' ? 'left' : 'right';

  const fetchDataSearch = async () => {
    const url = '/api/search';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        search: valueSearch
      })
    };
    await fetch(url, options).then(res => res.json()).then(result => setDataSearch(result));
  }

  useEffect(() => {
    setTimeout(() => {
      fetchDataSearch();
    }, 500)
  },[valueSearch]);
  
  return (
    <div className={`${props.customClass ? props.customClass : ''} overflow-hidden text-black absolute z-50 w-full left-0 px-12`}>
      <div className="flex gap-4 relative z-50 min-h-96 bg-white justify-center shadow-lg border px-6 py-4">
        {searchData && (
          <div className="w-60 flex flex-col gap-6">
            {searchData?.trendingLinks && (
              <div className="flex flex-col gap-3">
                <p className="font-medium text-xl">{t('global.trendingSearch')}</p>
                <ul className="flex flex-col gap-1.5">
                  {searchData.trendingLinks.map((item: any) => (
                      <li key={item._key}>
                        <Link to={params?.locale ? `/${params.locale + item.slug}` : item.slug} className="flex items-center gap-2">
                          <IconSearch /> {item.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {searchData?.collectionLinks && (
              <div className="flex flex-col gap-3">
                <p className="font-medium text-xl">{t('global.collections')}</p>
                <ul className="flex flex-col gap-1.5">
                  {searchData.collectionLinks.map((item: any) => (
                      <li key={item._key}>
                        <Link to={params?.locale ? `/${params.locale + item.slug}` : item.slug} className="flex items-center gap-1">
                          <IconCaret direction={direction} /> {item.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
              <p className="font-medium text-xl">{t('global.products')}</p>
              <Link
                to={params?.locale ? `/${params.locale}/search?q=${valueSearch}` : `/search?q=${valueSearch}`}
                className="block text-center text-sm font-normal underline"
               >
                {t('product.viewAllResults')}
              </Link>
          </div>
          <div className="grid gap-4 gap-y-6 grid-cols-5">
            {
              dataSearch?.products && dataSearch?.products?.nodes?.length > 0 ? dataSearch?.products?.nodes.map((product, i) => {
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    loading={getImageLoadingPriority(i)}
                  />
                )
              }) : dataSearch?.products?.nodes.length == 0 ? <div>{t('page.noResults')}</div> : (
                <>
                  {
                    [...new Array(5)].map((_, i) => {
                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <Skeleton className="w-full aspect-square"/>
                          <Skeleton className="w-28 h-3"/>
                          <Skeleton className="w-28 h-3"/>
                        </div>
                      )
                    })
                  }
                </>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recommendation;

