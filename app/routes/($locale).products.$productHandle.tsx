import {useRef, Suspense, useState, useEffect} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {
  defer,
  type MetaArgs,
  redirect,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, Await, useNavigate, useRouteLoaderData} from '@remix-run/react';
import {
  getSeoMeta,
  Money,
  ShopPayButton,
  VariantSelector,
  useOptimisticVariant,
  Image,
  getSelectedProductOptions,
  CartForm,
  Analytics,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import useLocation from 'react-use/esm/useLocation';
import {useTranslation} from 'react-i18next';
import type {RootLoader} from '~/root';
import type {
  ProductQuery,
  ProductVariantFragmentFragment,
} from 'storefrontapi.generated';
import {
  IconCaret,
  IconCheck,
  IconClose,
  GoStarIcon,
  UploadIcon,
} from '~/components/elements/Icon';

import {Heading, Section, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';
import {CustomInput} from '~/components/elements/CustomInput';
import {AddToCartButton} from '~/components/elements/AddToCartButton';
import {Breadcrumb} from '~/components/elements/Breadcrumb';
import {Skeleton} from '~/components/elements/Skeleton';
import {Share} from '~/components/elements/Share';
import {CustomModal} from '~/components/elements/CustomModal';

import {useStoreContext} from '~/components/global/StoreContext';
import {useDrawer} from '~/components/global/Drawer';
import {ProductGallery} from '~/components/product/ProductGallery';
import {ProductCarousel} from '~/components/product/ProductCarousel';
import {getBase64, getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import type {Storefront} from '~/lib/type';
import {WishlistButton} from '~/components/wishlist/WishlistButton';
import {CompareButton} from '~/components/compare/CompareButton';
import {ProductBundle} from '~/components/product/ProductBundle';
import {StockNotification} from '~/components/product/StockNotification';
import {routeHeaders} from '~/data/cache';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {CUSTOMER_INFO_QUERY} from '~/graphql/customer-account/CustomerInfoQuery';
import {ScrollToLoad} from '~/components/ScrollToLoad';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import i18next from '~/i18next.server';
import {SellingPlanSelector} from '~/components/product/SellingPlanSelector';
import type {
  ProductFragment,
  SellingPlanFragment,
} from 'storefrontapi.generated';
import {ValidateEmail} from '~/lib/utils';
// import { collection, query, where, getDocs } from 'firebase/firestore';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {productHandle} = params;
  const {storefront, customerAccount} = context;

  const locale = storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);
  invariant(productHandle, t('product.missingParam'));

  const selectedOptions = getSelectedProductOptions(request);

  const {shop, product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  if (!product.selectedVariant) {
    throw redirectToFirstVariant({
      product,
      request,
    });
  }

  const selectedSellingPlanId =
    new URL(request.url).searchParams.get('selling_plan') ?? null;

  let customer = null;
  if ((await customerAccount.isLoggedIn())) {
    const {data, errors} = await context.customerAccount.query(
      CUSTOMER_INFO_QUERY,
    );
    customer = data?.customer;
  }

  const selectedSellingPlanFirst =
    product.sellingPlanGroups.nodes?.[0]?.sellingPlans.nodes?.find(
      (sellingPlan: any) => sellingPlan.id === selectedSellingPlanId,
    ) ?? null;

  const selectedSellingPlanSecond = product.sellingPlanGroups.nodes?.map((sellingPlanGroup: any) => {
    const selected = sellingPlanGroup?.sellingPlans.nodes?.find(
      (sellingPlan: any) => sellingPlan.id === selectedSellingPlanId,
    ) ?? null;

    return selected;
  })

  const selectedSellingPlan = selectedSellingPlanSecond[1] || selectedSellingPlanFirst;

  if (product.sellingPlanGroups.nodes?.length && !selectedSellingPlan) {
    const firstSellingPlanId = product.sellingPlanGroups.nodes[0].sellingPlans.nodes[0].id;
    return redirect(
      `${request.url.split('/products/')[0]}/products/${product.handle}?selling_plan=${firstSellingPlanId}`,
    );
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
  const variants = context.storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  // TODO: Migrate to PostgreSQL - Firebase not compatible with Oxygen edge workers
  // const productReviewRef = collection(firestore, 'product_review');
  // const q = query(productReviewRef, where('productHandle', '==', productHandle));
  // const querySnapshot = await getDocs(q);
  // const reviewProduct = querySnapshot.docs.map(doc => doc.data());
  const reviewProduct = []; // Empty array until PostgreSQL migration

  return defer({
    variants,
    product,
    selectedSellingPlan,
    reviewProduct,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    customer,
    seo,
  });
}


export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductQuery['product'];
  request: Request;
}) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const firstVariant = product!.variants.nodes[0];
  for (const option of firstVariant.selectedOptions) {
    searchParams.set(option.name, option.value);
  }

  url.search = searchParams.toString();

  return redirect(url.href.replace(url.origin, ''), 302);
}

export default function Product() {
  const {
    product,
    shop,
    recommended,
    reviewProduct,
    variants,
    customer,
  } = useLoaderData<typeof loader>();

  const {media, title, vendor, descriptionHtml, sellingPlanGroups} = product;

  const selectedVariant = useOptimisticVariant(
    product.selectedVariant,
    variants,
  );

  const {shippingPolicy, refundPolicy} = shop;
  const {t} = useTranslation();

  const {pathname} = {
    pathname: '/products/' + product.handle,
  };

  const averageRating = product?.reviews ? JSON.parse(product.reviews?.value) : [];

  return (
    <>
      <Section padding="x">
        <div className="container">
          <Breadcrumb url={pathname} />
        </div>
        <div className="w-full max-w-full lg:max-w-[1696px] mx-auto md:px-6 lg:px-12 grid items-start md:gap-6 lg:gap-10 2xl:gap-20 md:grid-cols-2 lg:grid-cols-3">
          <ProductGallery
            media={media.nodes}
            selectedVariant={selectedVariant}
            className="md:w-full lg:col-span-2 md:px-0"
          />
          <div className="px-6 md:px-0 sticky pb-6 md:-mb-nav md:top-nav md:-translate-y-nav md:pt-nav hiddenScroll md:overflow-y-scroll">
            <section className="flex flex-col w-full max-w-xl md:mx-auto">
              <div className="grid gap-2">
                {vendor && (
                  <Link to={`/search?q=${vendor}`}>
                    <Text className="opacity-80 font-medium">{vendor}</Text>
                  </Link>
                )}
                <Heading as="h1" className="whitespace-normal">
                  {title}
                </Heading>
                <div className="flex items-center gap-1">
                  <Rating rating={Math.round(averageRating.value)} />
                  <span className="text-sm">
                    ({product.rating_count?.value ?? '0'} {t('product.reviews')})
                  </span>
                </div>
              </div>
              <Suspense fallback={<ProductForm variants={[]} sellingPlanGroups={[null]}/>}>
                <Await errorElement={t('product.formError')} resolve={variants}>
                  {(resp) => (
                    <ProductForm
                      variants={resp.product?.variants.nodes || []}
                      sellingPlanGroups={sellingPlanGroups}
                    />
                  )}
                </Await>
              </Suspense>
            </section>
          </div>
        </div>
      </Section>

      {product.bundle_products && (
        <ScrollToLoad customClass="min-h-40">
          <Section className="container mt-10">
            <ProductBundle
              product={product}
              bundleItems={product.bundle_products?.references?.nodes}
            />
          </Section>
        </ScrollToLoad>
      )}

      <Section className="container mt-4 md:mt-12 max-w-7xl">
        <div className="grid gap-12 py-4 mb-6">
          {descriptionHtml && (
            <ProductDetail
              title={t('product.details')}
              content={descriptionHtml}
            />
          )}
          {shippingPolicy?.body && (
            <ProductDetail
              title={t('product.shipping')}
              content={getExcerpt(shippingPolicy.body)}
              learnMore={`/policies/${shippingPolicy.handle}`}
            />
          )}
          {refundPolicy?.body && (
            <ProductDetail
              title={t('product.returns')}
              content={getExcerpt(refundPolicy.body)}
              learnMore={`/policies/${refundPolicy.handle}`}
            />
          )}
          {reviewProduct && (
            <ScrollToLoad customClass="min-h-[200px]">
              <CustomerReviews
                title={t('product.customerReviews')}
                reviewsInit={reviewProduct}
                product={product}
                customer={customer}
                key={product.handle}
              />
            </ScrollToLoad>
          )}
        </div>
      </Section>

      {product?.also_like && (
        <ScrollToLoad>
          <div className="container py-6 lg:py-10">
            <ProductCarousel
              title={t('product.alsoLike')}
              products={product?.also_like?.references?.nodes}
              settings={{itemsPerRow: 4, limitItems: 8}}
            />
          </div>
        </ScrollToLoad>
      )}

      <Suspense fallback={<Skeleton className="h-32" />}>
        <ScrollToLoad>
          <Await errorElement={t('product.relatedError')} resolve={recommended}>
            {(products) => (
              <div className="container py-6 lg:py-10">
                <ProductCarousel
                  title={t('product.related')}
                  products={products.nodes}
                  settings={{itemsPerRow: 4, limitItems: 8}}
                />
              </div>
            )}
          </Await>
        </ScrollToLoad>
      </Suspense>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: product.selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: product.selectedVariant?.id || '',
              variantTitle: product.selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

export function ProductForm({
  variants,
  sellingPlanGroups
}: {
  variants: ProductVariantFragmentFragment[];
  sellingPlanGroups: ProductFragment['sellingPlanGroups'];
}) {
  const {product, storeDomain, selectedSellingPlan} = useLoaderData<
    typeof loader
  >() as any;
  const {subcription} = useStoreContext() as any;

  const location = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeShopPay, setActiveShopPay] = useState(false);
  const [activeShopPayMobile, setActiveShopPayMobile] = useState(false);
  const [itemQty, setItemQty] = useState(1);
  const qtyRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const rootData = useRouteLoaderData<RootLoader>('root');
  const sizeGuideData = rootData?.sanityData?.settings[0]?.sizeGuide;

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);
  const {t} = useTranslation();
  const navigate = useNavigate();

  /* Gitcard form */
  const [enableSendGiftCard, setEnableSendGiftCard] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [sendOn, setSendOn] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    isOpen: isModalOpen,
    openDrawer: openModal,
    closeDrawer: closeModal,
  } = useDrawer();

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */

  const selectedVariant = useOptimisticVariant(
    product.selectedVariant,
    variants,
  );
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    Number(selectedVariant?.price?.amount) < Number(selectedVariant?.compareAtPrice?.amount);

  /* Set gitcard attribute */
  const attributesData = [];
  if (product.isGiftCard && enableSendGiftCard && errorMessage.length === 0) {
    attributesData.push({
      key: '__shopify_send_gift_card_to_recipient',
      value: 'on',
    });
    if (recipientEmail.length) {
      attributesData.push({
        key: 'Recipient email',
        value: recipientEmail,
      });
    }
    if (recipientName.length) {
      attributesData.push({
        key: 'Recipient name',
        value: recipientName,
      });
    }
    if (message.length) {
      attributesData.push({
        key: 'Message',
        value: message,
      });
    }
    if (sendOn.length) {
      attributesData.push({
        key: 'Send on',
        value: sendOn,
      });
    }
    attributesData.push({
      key: '__shopify_offset',
      value: '-420',
    });
  }

  const handleCheckSendGiftCard = (e: any) => {
    setEnableSendGiftCard(e?.target?.checked);
  };

  const handleCheckEmail = (e: any) => {
    setRecipientEmail(e.target.value);
    if (!ValidateEmail(e.target.value)) {
      setErrorMessage(t('errorMesg.invalidEmail'));
    } else {
      setErrorMessage('');
    }
  };

  const handleUpdateQty = (e: any) => {
    if (e === 'plus') {
      setItemQty(Number(itemQty + 1));
      if (qtyRef?.current) {
        qtyRef.current.value = Number(itemQty + 1).toString();
      }
    } else if (e === 'minus') {
      if (itemQty > 1) {
        setItemQty(Number(itemQty - 1));
        if (qtyRef?.current) {
          qtyRef.current.value = Number(itemQty - 1).toString();
        }
      }
    } else {
      const value = parseFloat(e.target.value);
      if (value <= 0) {
        setItemQty(1);
        e.target.value = 1;
      } else {
        setItemQty(value);
      }
    }
  };

  useEffect(() => {
    window.setTimeout(function () {
      setActiveShopPay(true);
    }, 1000);
    if (window.innerWidth < 1024) {
      setIsMobile(true);
      window.setTimeout(function () {
        setActiveShopPayMobile(true);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (addToCartFetchers.length) {
      setAddingToCart(true);
    } else {
      setAddingToCart(false);
    }
  }, [addToCartFetchers]);

  return (
    <div className="grid gap-4">
      <ProductPrice
        selectedVariant={selectedVariant}
        variants={variants[0]?.sellingPlanAllocations}
        selectedSellingPlan={selectedSellingPlan}
        subcription={subcription}
        isOnSale={isOnSale}
      />
      {
        sellingPlanGroups && sellingPlanGroups?.nodes?.length > 0 ? (
          <SellingPlanSelector
            sellingPlanGroups={sellingPlanGroups}
            selectedSellingPlan={selectedSellingPlan}
            selectedVariant={selectedVariant}
            variants={variants}
          />
        ) : null
      }
      
      <VariantSelector
        handle={product.handle}
        options={product.options.filter((option: any) => option.values.length > 1)}
        variants={variants}
      >
        {({option}) => {
          if(option.name === 'Title') {
            return null;
          }
          return (
            <div
              key={option.name}
              className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
            >
              <div className="flex justify-between">
                <Heading as="legend" size="lead" className="font-medium">
                  {option.name}
                  {option.name === 'Color' && (
                    <>
                      :{' '}
                      <span className="opacity-50 text-copy font-normal">
                        {selectedVariant?.selectedOptions?.map(
                          (option: any) => {
                            return (
                              option.name == 'Color' && (
                                <span key={option.value}>{option.value}</span>
                              )
                            );
                          },
                        )}
                      </span>
                    </>
                  )}
                </Heading>
                {option.name == 'Size' && (
                  <div onClick={openModal} aria-hidden="true">
                    <div className="text-sm font-medium border-b-2 border-black cursor-pointer uppercase">
                      {t('product.sizeGuide')}
                    </div>
                    <CustomModal
                      isOpen={isModalOpen}
                      onClose={closeModal}
                    >
                      <div dangerouslySetInnerHTML={{__html: sizeGuideData}} />
                    </CustomModal>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-baseline gap-4">
                {option.values.length > 7 ? (
                  <div className="relative w-full">
                    <Listbox
                        onChange={(selectedOption) => {
                          const value = option.values.find(
                            (v) => v.value === selectedOption,
                          );

                          if (value) {
                            navigate(value.to);
                          }
                        }}
                      >
                      {({open}) => (
                        <>
                          <Listbox.Button
                            ref={closeRef}
                            className={clsx(
                              'flex items-center justify-between w-full py-3 px-4 border border-primary',
                              open
                                ? 'rounded-b md:rounded-t md:rounded-b-none'
                                : 'rounded',
                            )}
                          >
                            <span>{option.value}</span>
                            <IconCaret direction={open ? 'up' : 'down'} />
                          </Listbox.Button>
                          <Listbox.Options
                            className={clsx(
                              'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                              open ? 'max-h-48' : 'max-h-0',
                            )}
                          >
                            {option.values
                              .filter((value) => value.isAvailable)
                              .map(({value, to, isActive}) => (
                                <Listbox.Option
                                  key={`option-${option.name}-${value}`}
                                  value={value}
                                >
                                  {({active}) => (
                                    <Link
                                      to={to}
                                      preventScrollReset
                                      className={clsx(
                                        'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                        active && 'bg-primary/10',
                                      )}
                                      onClick={() => {
                                        if (!closeRef?.current) return;
                                        closeRef.current.click();
                                      }}
                                    >
                                      {value}
                                      {isActive && (
                                        <span className="ml-2">
                                          <IconCheck />
                                        </span>
                                      )}
                                    </Link>
                                  )}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </>
                      )}
                    </Listbox>
                  </div>
                ) : (
                  <>
                    {option.values.map(({value, isAvailable, isActive, to}) => {
                      const variant = variants?.find((variant: ProductVariantFragmentFragment) => {
                        const color = variant?.selectedOptions?.find(
                          (item: any) => item?.name === 'Color',
                        );

                        return value === color?.value;
                      });

                      return option.name === 'Color' ? (
                        <Link
                          key={option.name + value}
                          to={to}
                          preventScrollReset
                          prefetch="intent"
                          replace
                          className={clsx(
                            'leading-none border cursor-pointer inline-block',
                            isActive ? 'border-black' : 'border-primary/0',
                            isAvailable ? 'opacity-100' : 'opacity-50',
                          )}
                        >
                          <Image
                            alt={value}
                            data={variant?.image}
                            width={80}
                            height={80}
                          />
                        </Link>
                      ) : (
                        <Link
                          key={option.name + value}
                          to={to}
                          preventScrollReset
                          prefetch="intent"
                          replace
                          className={clsx(
                            'leading-none border cursor-pointer inline-block',
                            isActive ? 'border-black' : 'border-primary/0',
                            isAvailable ? 'opacity-100' : 'opacity-50',
                          )}
                        >
                          <span className="block p-1">{value}</span>
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          );
        }}
      </VariantSelector>

      {/* Giftcard form */}
      {product.isGiftCard && (
        <>
          <div className="flex items-center gap-2 -mt-2 mb-2">
            <input
              type="checkbox"
              checked={enableSendGiftCard}
              onChange={handleCheckSendGiftCard}
              className="cursor-pointer"
            />
            <p>{t('product.giftCardNote')}</p>
          </div>
          {enableSendGiftCard && (
            <div className="grid gap-4 mb-2">
              <input
                type="text"
                value={recipientEmail}
                placeholder={t('product.recipientEmail')}
                onChange={(e) => {
                  handleCheckEmail(e);
                }}
              />
              {errorMessage.length > 0 && (
                <p className="text-sm text-red-500 -mt-2">{errorMessage}</p>
              )}
              <input
                type="text"
                value={recipientName}
                placeholder={t('product.recipientName')}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                }}
              />
              <textarea
                type="text"
                value={message}
                placeholder={t('product.recipientMessage')}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                maxLength="200"
              />
              <div className="relative">
                <label className="absolute bg-white text-xs -top-1.5 left-2 rtl:left-auto rtl:right-2 px-1.5 text-gray-600">
                {t('product.sendOn')}
                </label>
                <input
                  type="date"
                  value={sendOn}
                  onChange={(e) => {
                    setSendOn(e.target.value);
                  }}
                  className="input-date w-full"
                />
              </div>
            </div>
          )}
        </>
      )}

      {selectedVariant && (
        <div className="grid items-stretch gap-4">
          {isOutOfStock ? (
            <Button variant="secondary" disabled>
              <Text>{t('global.soldOut')}</Text>
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-48 flex items-center border border-gray-400 rounded">
                <button
                  onClick={() => handleUpdateQty('minus')}
                  className="min-w-10 h-12 flex items-center justify-center cursor-pointer text-xl"
                  disabled={itemQty <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  ref={qtyRef}
                  defaultValue={1}
                  aria-label="Qty"
                  className="w-full bg-transparent min-w-12 no-spin border-gray-400 border-t-0 border-b-0 text-center h-12"
                  onChange={(e) => handleUpdateQty(e)}
                />
                <button
                  onClick={() => handleUpdateQty('plus')}
                  className="min-w-10 h-12 flex items-center justify-center cursor-pointer text-lg"
                >
                  +
                </button>
              </div>
              <div className="w-full">
                <AddToCartButton
                  lines={[
                    {
                      merchandiseId: selectedVariant.id!,
                      sellingPlanId: subcription !== 'oneTimePurchase' ? selectedSellingPlan?.id : null,
                      quantity: itemQty ? itemQty : 1,
                      attributes: attributesData,
                      selectedVariant
                    },
                  ]}
                  variant="primary"
                  data-test="add-to-cart"
                  className={`${
                    addingToCart ? 'opacity-60' : ''
                  } w-full bg-stone-900 text-white px-2 h-12 rounded btn-primary`}
                >
                  <Text
                    as="span"
                    className="flex items-center justify-center gap-2 font-medium"
                  >
                    {addingToCart ? (
                      <span>{t('global.adding')}</span>
                    ) : (
                      <span>{t('global.addToCart')}</span>
                    )}
                  </Text>
                </AddToCartButton>
              </div>
            </div>
          )}
          {!isOutOfStock && (
            <>
              {isMobile ? (
                <div className="bg-[#5a31f4] w-full h-[42px] rounded">
                  {activeShopPayMobile ? (
                    <ShopPayButton
                      width="100%"
                      variantIds={[selectedVariant?.id!]}
                      storeDomain={storeDomain}
                    />
                  ) : (
                    <span className="block w-full text-center text-white font-medium text-xl leading-10">
                      ShopPay
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-[#5a31f4] w-full h-[42px] rounded">
                  {activeShopPay ? (
                    <ShopPayButton
                      width="100%"
                      variantIds={[selectedVariant?.id!]}
                      storeDomain={storeDomain}
                    />
                  ) : (
                    <span className="block w-full text-center text-white font-medium text-xl leading-10">
                      ShopPay
                    </span>
                  )}
                </div>
              )}
            </>
          )}
          {isOutOfStock && (
            <StockNotification selectedVariant={selectedVariant} />
          )}
        </div>
      )}
      <div className="flex items-center gap-x-4 md:gap-x-8 relative py-2">
        <WishlistButton handle={product.handle} showText={true} />
        <CompareButton handle={product.handle} showText={true} />
        <Share url={location?.href} />
      </div>
      <div className="overflow-hidden">
        <p className="mb-1">
          <span className="font-medium">{t('product.sku')}:</span>{' '}
          <span className="opacity-80">
            {selectedVariant?.sku ? selectedVariant?.sku : 'N/A'}
          </span>
        </p>
        <p>
          <span className="font-medium uppercase">
            {t('global.categories')}:
          </span>{' '}
          {product.collections?.edges?.length > 0
            ? product.collections?.edges?.map((collection: any) => (
                <Link
                  to={`/collections/${collection.node.handle}`}
                  className="mr-1 opacity-80 hover:underline"
                  key={collection.node.handle}
                >
                  {collection.node.title}{' '},
                </Link>
              ))
            : 'N/A'}
        </p>
        {product.tags?.length > 0 && (
          <p>
            <span className="font-medium uppercase">{t('global.tags')}:</span>
              {product.tags?.map((tag: any) => (
                <Link
                  key={tag}
                  to={`/search?q=${tag}`}
                  className="m-1 bg-gray-200 px-3 py-0.5 rounded inline-block hover:bg-black hover:text-white"
                >
                  {tag}
                </Link>
              ))}
          </p>
        )}
      </div>
    </div>
  );
}

function ProductPrice({
  selectedVariant,
  variants,
  selectedSellingPlan,
  isOnSale,
  subcription
}: {
  selectedVariant: ProductVariantFragmentFragment;
  selectedSellingPlan: SellingPlanFragment | null;
  variants: any
  isOnSale: boolean;
  subcription: string;
}) {

  if(subcription == 'oneTimePurchase') {
    return (
      <ProductVariantPrice selectedVariant={selectedVariant} isOnSale={isOnSale}/>
    )
  }

  return (
    <div className="product-price">
      {variants?.nodes && selectedSellingPlan && subcription ? (
        <SellingPlanPrice
          selectedSellingPlan={selectedSellingPlan}
          variantsPrice={variants?.nodes}
          selectedVariant={selectedVariant}
        />
      ) : (
        <ProductVariantPrice selectedVariant={selectedVariant} isOnSale={isOnSale}/>
      )}
    </div>
  );
}

type SellingPlanPrice = {
  amount: number;
  currencyCode: string;
};

/*
  Render the selected selling plan price is available
*/
function SellingPlanPrice({
  selectedSellingPlan,
  variantsPrice,
  type,
}: {
  selectedSellingPlan: SellingPlanFragment;
  variantsPrice: any;
  type?: string;
}) {
  const planPrice = variantsPrice.find((item: any) => item.sellingPlan.id == selectedSellingPlan.id);
  const selectedVariantPrice = planPrice.priceAdjustments[0];

  return (
    <div className={`${type === 'small' ? 'text-xl font-semibold' : 'text-xl font-semibold my-4'}`}>
        <Text as="h2" className="flex gap-2 items-center">
          {selectedVariantPrice?.compareAtPrice && (
            <Money
              data={{
                amount: `${selectedVariantPrice.compareAtPrice.amount}`,
                currencyCode: selectedVariantPrice.compareAtPrice.currencyCode,
              }}
              as="span"
              className={`${type === 'small' ? 'text-sm' : 'text-lg'} opacity-60 font-medium line-through`}
            />
          )}
          <Money
            data={{
              amount: `${selectedVariantPrice.price.amount}`,
              currencyCode: selectedVariantPrice.price.currencyCode,
            }}
            as="span"
            className={`${type === 'small' ? 'text-md' : 'text-2xl'}`}
            data-test="price"
          />
        </Text>
      </div>
  );
}

/**
  Render the price of a product that does not have selling plans
**/
function ProductVariantPrice({
  selectedVariant,
  isOnSale
}: {
  selectedVariant: ProductVariantFragmentFragment;
  isOnSale: boolean;
}) {
  return selectedVariant?.compareAtPrice ? (
    <>
      <div className="text-xl font-semibold my-4">
        <Text as="h2" className="flex gap-3 items-center">
          {isOnSale && (
            <Money
              data={selectedVariant?.compareAtPrice!}
              as="span"
              className="opacity-60 text-lg font-medium line-through"
            />
          )}
          <Money
            data={selectedVariant?.price!}
            as="span"
            className={`${isOnSale ? 'text-red-600' : ''} text-2xl`}
            data-test="price"
          />
        </Text>
      </div>
    </>
  ) : (
    selectedVariant?.price && (
      <div className="text-xl font-semibold my-4">
        <Text as="h2" className="flex gap-3 items-center">
          <Money 
            data={selectedVariant?.price} 
            className="text-2xl"
          />
        </Text>
      </div>
    )
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  const {t} = useTranslation();

  return (
    <Disclosure defaultOpen key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h3" className="uppercase text-heading4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  {t('global.learnMore')}
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function CustomerReviews({
  title,
  reviewsInit,
  product,
  customer,
}: {
  title: string;
  reviewsInit: any;
  product: any;
  customer: any;
}) {
  const email = customer?.emailAddress?.emailAddress ?? null;
  const {t} = useTranslation();

  const [reviews, setReviews] = useState([]);
  const [ownReviews, setOwnReviews] = useState(reviewsInit);
  const averageRating =
    reviewsInit.reduce((total: any, item: any) => {
      return total + Number(item.rating);
    }, 0) / reviewsInit.length;

  const [isFormSent, setIsFormSent] = useState(false);
  const [formCheck, setFormCheck] = useState(false);

  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState('');
  const [nickname, setNickname] = useState('');
  const [review, setReview] = useState('');
  const [files, setFiles] = useState('');
  const [formSending, setFormSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageUploadFile, setErrorMessageUploadFile] = useState<any>();
  const [previewImage, setPreviewImage] = useState<any>('');
  const [activeReviewId, setActiveReviewId] = useState(0);
  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [page, setPage] = useState<number>(0);
  const ITEM_PER_PAGE = 10;

  const getFromAndTo = (page:number) => {
    let from = page * ITEM_PER_PAGE;
    let to = from + ITEM_PER_PAGE;

    if (!page) {
      to = 0;
    } 

    return {
      from,
      to
    }
  }

  const MAX_FILE_SIZE = 2048; // 2MB
  const MAX_FILE = 3;

  const checkFileSize = (files: any) => {
    let flag = 0;
    for (const file of files) {
      if((file.size / 1000) > MAX_FILE_SIZE) {
        flag = 1;
      }
    }

    return flag ? false : true;
  }

  const uploadMultipleFiles = (event: any) => {
    const files = event.target.files;
    const previewImageArray = Promise.all([...files].map((file) => getBase64(file)));
    previewImageArray.then(v => Promise.all(v)).then(v => setPreviewImage(v)).catch(err => console.error(err));
    const fileArray = Promise.all(([...files] || []).map(async (file) => {
      const {type, name, size} = file
      const fileImageToBase64 = await getBase64(file)
      return {
        type,
        name,
        size,
        fileImageToBase64
      }
    }));

    fileArray.then(v => Promise.all(v)).then(v => setFiles(v)).catch(err => console.error(err));
  }

  const {
    isOpen: isModalOpen,
    openDrawer: openModal,
    closeDrawer: closeModal,
  } = useDrawer();

  const handleModalImage = (index: any, reviewId: number) => {
    setActiveModalIndex(index);
    setActiveReviewId(reviewId);
    openModal(true);
  }

  const handleSubmitForm = async () => {
    setFormCheck(true);
    if (
      summary.trim() === '' ||
      nickname.trim() === '' ||
      review.trim() === ''
    ) {
      return;
    }

    if (files && files?.length > MAX_FILE) {
      setErrorMessageUploadFile(t('product.fileLimit'))
      return
    } else if (!checkFileSize(files)) {
      setErrorMessageUploadFile(t('product.fileSize'));
      return;
    } else {
      setErrorMessageUploadFile('');
    }
    
    setFormCheck(false);
    setFormSending(true);

    const url = '/api/reviewProduct';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        reviews,
        review: review.trim(),
        nickname: nickname.trim(),
        summary: summary.trim(),
        product,
        rating,
        email: email.trim(),
        files: files || null
      }),
    };

    const {response} = await fetch(url, options)
      .then((res: any) => {
        if(!res.ok) {
          setErrorMessage(t('errorMesg.wrong'));
          setFormSending(false);
          return;
        }
        setIsFormSent(true);
        return res.json();
      })

    const reviewsUpadte: any =
      response.data.metafieldsSet.metafields.find((item: any) => {
        return item.key === 'review_content';
      }) || [];

    setOwnReviews(reviewsUpadte ? JSON.parse(reviewsUpadte.value) : []);
  };

  const reviewsSorted = reviews.sort((a: any, b: any) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  
  const ownCustomerReview = ownReviews.find(
    (review: any) => review.customer.email === email,
    );
    
  const otherCustomrReviews = reviewsSorted.filter(
    (review: any) => review.customer.email !== email,
  );

  useEffect(() => {
    if(page >= 0) {
      const {from, to} = getFromAndTo(page);

      const fetchDataReview = async ({productHandle, from, to}:{productHandle:string, from: number, to: number}) => {
      const url = '/api/paginationFirebase';
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          productHandle,
          limit: ITEM_PER_PAGE,
          from,
          to
        }),
      };
  
      await fetch(url, options)
        .then((res: any) => {
          return res.json();
        })
        .then((result) => setReviews(result));
      }
      fetchDataReview({
        productHandle: product.handle,
        from,
        to
      })
    }

    if(page < 0 || reviewsInit.length == ITEM_PER_PAGE) {
      setPage(0);
    }
  },[page])

  return (
    <Disclosure defaultOpen key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <div className="md:flex items-center gap-3">
                <Text size="lead" as="h4" className="uppercase text-heading4">
                  {title}
                </Text>
                <div className="flex items-center gap-1">
                  <Rating
                    className="text-lg"
                    rating={Math.round(averageRating)}
                  />
                  <span>
                    ({reviewsInit.length} {t('product.reviews')})
                  </span>
                </div>
              </div>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className="grid">
            <div className="divide-y">
              {otherCustomrReviews.map(
                (review: any, index: number) =>
                  (
                    <div
                      key={review.customer.name}
                      className="flex flex-col gap-2 py-4"
                    >
                      <h4 className="font-medium text-lg flex items-center gap-3">
                        {review.title} <Rating rating={review.rating} />
                      </h4>
                      <div className="flex items-center gap-2 text-sm opacity-60">
                        <div>
                          {t('product.reviewBy')}{' '}
                          <span className="font-bold">
                            {review.customer.name}
                          </span>
                        </div>
                        •
                        <span>{new Date(review.createdAt).toDateString()}</span>
                      </div>
                      <p>{review.description}</p>
                      <div className="flex gap-4">
                        {
                          review?.images && review?.images.map((item: any, index: number) => {
                            return (
                              <div key={index}>
                                <Image
                                  alt={review.title}
                                  data={{url: item}}
                                  sizes="(max-width: 32em) 50vw, 33vw"
                                  className="max-w-24 md:max-w-28 aspect-square object-contain border cursor-pointer"
                                  loading={'lazy'}
                                  onClick={() => {
                                    handleModalImage(index, review?.id);
                                  }}
                                />
                              </div>
                            )
                          })
                        }
                      </div>
                      {review?.images && (activeReviewId === review?.id) && (
                        <CustomModal
                          isOpen={isModalOpen}
                          onClose={closeModal}
                        >
                          <Image
                            alt="review image"
                            data={{url: review?.images[activeModalIndex]}}
                            sizes="(max-width: 32em) 50vw, 33vw"
                            loading={'lazy'}
                          />
                        </CustomModal>
                      )}
                    </div>
                  ),
              )}
            </div>

            {
              reviews.length > 0 && (otherCustomrReviews.length < (reviewsInit.length - (ownCustomerReview?.id ? 1 : 0))) && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <div>
                    <p className="underline">Showing {otherCustomrReviews.length} of {reviewsInit.length - (ownCustomerReview?.id ? 1 : 0)} results</p>
                  </div>
                  <div className="flex justify-end gap-1">
                    <button className="font-semibold px-3 py-2 disabled:opacity-50" onClick={() => setPage(page - 1)} disabled={!page ? true : false}>
                      <span className="flex items-center"><IconCaret direction="right" /> Previous</span>
                    </button>
                    <button className="font-semibold px-3 py-2 disabled:opacity-50" onClick={() => setPage(page + 1)} disabled={reviewsInit.length == ITEM_PER_PAGE || reviews.length < ITEM_PER_PAGE || (Math.ceil(reviewsInit.length / ITEM_PER_PAGE) == page + 1) ? true : false}>
                      <span className="flex items-center">Next <IconCaret direction="left" /></span>
                    </button>
                  </div>
                </div>
              )
            }
            {!otherCustomrReviews.length && (
              <div>{t('product.reviewEmpty')}</div>
            )}
            <div className="flex flex-col gap-4 border-t pt-6 mt-6">
              <Text size="lead" as="h3" className="font-medium uppercase">
                {ownCustomerReview
                  ? t('product.yourReview')
                  : t('product.writeReview')}
              </Text>
              {email ? (
                <>
                  {ownCustomerReview ? (
                    <>
                      <h4 className="text-lg flex items-center gap-3">
                        {ownCustomerReview.title}
                        <Rating rating={ownCustomerReview.rating} />
                      </h4>
                      <div className="flex items-center gap-2">
                        <div>
                          {t('product.reviewBy')}{' '}
                          <span className="font-bold">
                            {ownCustomerReview.customer.name}
                          </span>
                        </div>
                        •
                        <span>
                          {new Date(ownCustomerReview.createdAt).toDateString()}
                        </span>
                      </div>
                      <p>{ownCustomerReview.description}</p>
                      <div className="flex gap-4">
                        {
                          ownCustomerReview?.images && ownCustomerReview?.images.map((item: any, index: number) => {
                            return (
                              <div key={index}>
                                <Image
                                  alt={ownCustomerReview.title}
                                  data={{url: item}}
                                  sizes="(max-width: 32em) 50vw, 33vw"
                                  className="max-w-24 md:max-w-28 aspect-square object-contain border cursor-pointer"
                                  loading={'lazy'}
                                  onClick={() => {
                                    handleModalImage(index, ownCustomerReview.id);
                                  }}
                                />
                              </div>
                            )
                          })
                        }
                      </div>
                      {ownCustomerReview?.images && (activeReviewId === ownCustomerReview?.id) && (
                        <CustomModal
                          isOpen={isModalOpen}
                          onClose={closeModal}
                        >
                          <Image
                            alt="review image"
                            data={{url: ownCustomerReview?.images[activeModalIndex]}}
                            sizes="(max-width: 32em) 50vw, 33vw"
                            loading={'lazy'}
                          />
                        </CustomModal>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        {t('product.reviewing')} {product.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {t('product.yourRating')}{' '}
                        <Rating
                          rating={rating}
                          setRating={setRating}
                          className="text-2xl"
                        />
                      </div>
                      <CustomInput
                        label={t('product.nickname')}
                        invalidMessage={t('product.nicknameEmpty')}
                        isRequire={true}
                        value={nickname}
                        check={formCheck}
                        isFormSent={isFormSent}
                        setValue={setNickname}
                        setFormCheck={setFormCheck}
                        validate={(value: string) => value !== ''}
                      />
                      <CustomInput
                        label={t('product.summary')}
                        invalidMessage={t('product.summaryEmpty')}
                        isRequire={true}
                        value={summary}
                        check={formCheck}
                        isFormSent={isFormSent}
                        setValue={setSummary}
                        setFormCheck={setFormCheck}
                        validate={(value: string) => value !== ''}
                      />
                      <CustomInput
                        label={t('product.review')}
                        invalidMessage={t('product.reviewWarning')}
                        isRequire={true}
                        value={review}
                        check={formCheck}
                        isFormSent={isFormSent}
                        setValue={setReview}
                        setFormCheck={setFormCheck}
                        validate={(value: string) => value !== ''}
                        type="textarea"
                      />
                      <div className="mb-4">
                        <label className="cursor-pointer mb-1">
                          <span className="inline-block">
                            <span className="flex items-center gap-2 py-2 px-5 border border-black/20 rounded hover:bg-black hover:text-white">
                              <UploadIcon /> {t('product.addPhoto')}
                            </span>
                          </span>
                          <input
                            type="file"
                            id="imageReview"
                            name="imageReview"
                            accept="image/*"
                            multiple
                            onChange={(e:any) => uploadMultipleFiles(e)}
                            className="mb-1 hidden"
                          />
                        </label>
                          {!errorMessageUploadFile ? (
                            ''
                          ) : (
                            <p className={`text-red-500 relative top-2 text-xs `}>
                             {errorMessageUploadFile}
                            </p>
                          )}
                      </div>

                      {previewImage.length > 0 && (
                        <div className="flex gap-2">
                          {previewImage?.map((item: any, index: number) => (
                            <img src={item} key={index} alt="Review image" className="max-w-56 object-contain" />
                          ))}
                        </div>
                      )}

                      {errorMessage && (
                        <p className="text-red-600">{errorMessage}</p>
                      )}
                      <div className="inline-block">
                        <Button
                          className={`font-normal uppercase select-none ${
                            formSending && 'pointer-events-none'
                          }`}
                          onClick={handleSubmitForm}
                        >
                          {formSending
                            ? t('button.sending')
                            : t('product.submitReview')}
                        </Button>
                      </div>
                      {isFormSent && (
                        <div className="animate-[fade_0.5s_ease-in-out] z-40 -mt-4">
                          <div className="fixed z-50 top-0 left-0 right-0 bottom-0 m-auto max-w-[400px] max-h-[200px] bg-white text-center p-6 rounded flex items-center justify-center">
                            <div>
                              <h3 className="text-xl font-bold">
                                {t('product.reviewSuccessHeading')}
                              </h3>
                              <p>{t('product.reviewSuccessMessage')}</p>
                              <span
                                onClick={(e) => setIsFormSent(false)}
                                className="p-2 cursor-pointer absolute top-0 right-0"
                                aria-hidden="true"
                              >
                                <IconClose />
                              </span>
                            </div>
                          </div>
                          <div className="fixed z-40 bg-[rgba(0,0,0,0.3)] w-full h-full top-0 left-0">
                            &nbsp;
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p>
                  {t('product.loginToReview')}{' '}
                  <Link to="/account/login" className="underline">
                    {t('product.signIn')}
                  </Link>{' '}
                  {t('product.or')}{' '}
                  <Link to="/account/register" className="underline">
                    {t('product.createAccount')}
                  </Link>
                </p>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function Rating({
  rating = 0,
  setRating,
  className,
}: {
  rating?: number;
  setRating?: any;
  className?: string;
}) {
  const ratingE = [];
  for (let i = 0; i < 5; i++) {
    ratingE.push(
      <div
        key={i}
        onClick={() => {
          if (setRating) {
            setRating(i + 1);
          }
        }}
        className={`${setRating ? 'cursor-pointer' : ''} ${className}`}
        aria-hidden="true"
      >
        {i < rating ? (
          <GoStarIcon color="orange" />
        ) : (
          <GoStarIcon color="#bbbbbb" />
        )}
      </div>,
    );
  }
  return <div className="flex items-center gap-0.5 pt-[1px]">{ratingE}</div>;
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sellingPlanAllocations(first: 10) {
      nodes {
        sellingPlan {
          id
          name
          options {
            name
            value
          }
        }
        priceAdjustments {
          compareAtPrice {
            amount
            currencyCode
          }
          unitPrice {
            amount
            currencyCode
          }
          perDeliveryPrice {
            amount
            currencyCode
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      id
      title
      handle
    }
  }
`;


const SELLING_PLAN_FRAGMENT = `#graphql
  fragment SellingPlanMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment SellingPlan on SellingPlan {
    id
    options {
      name
      value
    }
    priceAdjustments {
      orderCount
      adjustmentValue {
        ... on SellingPlanFixedAmountPriceAdjustment {
          __typename
          adjustmentAmount {
            ... on MoneyV2 {
               ...SellingPlanMoney
            }
          }
        }
        ... on SellingPlanFixedPriceAdjustment {
          __typename
          price {
            ... on MoneyV2 {
              ...SellingPlanMoney
            }
          }
        }
        ... on SellingPlanPercentagePriceAdjustment {
          __typename
          adjustmentPercentage
        }
      }
      orderCount
    }
    recurringDeliveries
    checkoutCharge {
      type
      value {
        ... on MoneyV2 {
          ...SellingPlanMoney
        }
        ... on SellingPlanCheckoutChargePercentageValue {
          percentage
        }
      }
    }
 }
` as const;

//  8. Add the SellingPlanGroup fragment to the Product fragment
const SELLING_PLAN_GROUP_FRAGMENT = `#graphql
  fragment SellingPlanGroup on SellingPlanGroup {
    name
    options {
      name
      values
    }
    sellingPlans(first:10) {
      nodes {
        ...SellingPlan
      }
    }
  }
  ${SELLING_PLAN_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      tags
      isGiftCard
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...ProductVariantFragment
      }
      collections(first: 5) {
        edges {
          node {
            title
            handle
          }
        }
      }
      media(first: 50) {
        nodes {
          ...Media
        }
      }
      reviews: metafield(key: "review", namespace: "custom") {
        value
      }
      rating_count: metafield(key: "rating_count", namespace: "custom") {
        value
      }
      bundle_products: metafield(key: "bundle_products", namespace: "custom") {
        id
        references(first: 10) {
          nodes {
            ... on Product {
              ...ProductCard
            }
          }
        }
      }
      bundle_price: metafield(key: "bundle_price", namespace: "custom") {
        id
        value
        type
      }
      also_like: metafield(key: "also_like", namespace: "custom") {
        id
        references(first: 10) {
          nodes {
            ... on Product {
              ...ProductCard
            }
          }
        }
      }
      images(first: 3) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      variants(first: 50) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
      sellingPlanGroups(first:10) {
        nodes {
          ...SellingPlanGroup
        }
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${SELLING_PLAN_GROUP_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  query variants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 250) {
        nodes {
          ...ProductVariantFragment
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
