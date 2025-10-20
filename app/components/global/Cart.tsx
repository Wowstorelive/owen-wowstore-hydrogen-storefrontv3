import clsx from 'clsx';
import {useRef} from 'react';
import useScroll from 'react-use/esm/useScroll';
import {
  CartForm,
  Image,
  Money,
  useOptimisticCart,
  type CartReturn,
} from '@shopify/hydrogen';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useTranslation} from 'react-i18next';

import {IconRemove, GiftIcon, IconClose} from '~/components/elements/Icon';
import {Heading, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';

import {FeaturedProducts} from '~/components/product/FeaturedProducts';
import {getInputStyleClasses} from '~/lib/utils';
import { FetcherWithComponents } from '@remix-run/react';

type Layouts = 'page' | 'drawer';

export function Cart({
  layout,
  onClose,
  cart: originalCart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartReturn | null;
}) {
  const cart = useOptimisticCart(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </>
  );
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: CartType | null;
}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
  };

  return (
    <div className={container[layout]}>
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartGiftCard giftCardCodes={cart.appliedGiftCards} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];
  const {t} = useTranslation();
  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes && codes.length !== 0 ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">{t('global.discounts')}</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes?.join(', ')}</Text>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div
          className={clsx(
            'flex',
            'items-center gap-4 justify-between text-copy',
          )}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder={t('global.discountCode')}
          />
          <button className="flex justify-end font-medium whitespace-nowrap">
            {t('global.applyDiscount')}
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const {t} = useTranslation();
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] = giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];
  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }
  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }
  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <Text as="dt" className="text-sm">{t('global.appliedGift')}</Text>
          <div className="bg-gray-100 inline-block rounded px-2 py-0.5 my-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GiftIcon className="w-5 h-5" />
                <Text as="dd" className="text-sm">{codes?.join(', ')}</Text>
              </div>
              <UpdateGiftCardForm>
                <button onSubmit={() => removeAppliedCode} className="w-4 h-4">
                  <IconClose className="w-full h-full mt-0.5" aria-label={t('global.removeGift')} />
                </button>
              </UpdateGiftCardForm>
            </div>
          </div>
        </div>
      </dl>
      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm giftCardCodes={appliedGiftCardCodes.current} saveAppliedCode={saveAppliedCode}>
        <div className="flex items-center gap-4">
          <input
            className={getInputStyleClasses()}
            type="text" name="giftCardCode"
            placeholder={t('global.giftCardCode')}
            ref={giftCardCodeInput}
          />
          <button type="submit" className="flex justify-end font-medium whitespace-nowrap">
            {t('global.apply')}
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}
function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code) saveAppliedCode && saveAppliedCode(code as string);
        return children;
      }}
    </CartForm>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {

  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const className = clsx([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      <ul className="grid gap-6 lg:gap-8">
        {(cartLines?.nodes ?? []).map((line: CartLine) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;
  const {t} = useTranslation();
  return (
    <div className="flex flex-col mt-2">
      <a href={checkoutUrl} target="_self">
        <Button as="span" width="full" className="btn-primary">
          {t('cart.continueCheckout')}
        </Button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartCost;
  layout: Layouts;
}) {
  const summary = {
    drawer: 'grid gap-4 p-6 border-t md:px-12',
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded w-full',
  };
  const {t} = useTranslation();
  return (
    <section aria-labelledby="summary-heading" className={summary[layout]}>
      <h2 id="summary-heading" className="sr-only">
        {t('cart.orderSummary')}
      </h2>
      <dl className="grid">
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">{t('cart.subtotal')}</Text>
          <Text as="dd" data-test="subtotal">
            {cost?.subtotalAmount?.amount ? (
              <Money data={cost?.totalAmount ?? cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </Text>
        </div>
      </dl>
      {children}
    </section>
  );
}

function CartLineItem({line}: {line: CartLine}) {

  if (!line?.id) return null;

  const {id, quantity, merchandise, sellingPlanAllocation, isOptimistic} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  return (
    <li
      key={id}
      className="flex gap-4"
    >
      <div className="flex-shrink aspect-square min-w-24 max-w-24">
        {merchandise.image && (
          <Image
            width={110}
            height={110}
            data={merchandise.image}
            className="object-cover object-center aspect-square w-full"
            alt={merchandise.title}
          />
        )}
      </div>

      <div className="flex gap-2 justify-between flex-grow">
        <div className="grid">
          <Heading as="h3" size="copy" className="text-sm mb-1">
            {merchandise?.product?.handle ? (
              <Link to={`/products/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
              </Link>
            ) : (
              <Text>{merchandise?.product?.title || ''}</Text>
            )}
          </Heading>

          <div className="grid">
            {(merchandise?.selectedOptions || []).map(
              (option) =>
                option.value !== 'Default Title' && (
                  <Text
                    color="subtle"
                    key={option.name}
                    className="text-sm opacity-60"
                  >
                    {option.name}: {option.value}
                  </Text>
                ),
            )}
          </div>

          {line?.attributes?.length > 0 && (
            <div className="grid">
              {(line.attributes || []).map(
                (option) =>
                  option.key.charAt(0) !== '_' && (
                    <Text
                      color="subtle"
                      key={option.key}
                      className="text-sm opacity-60"
                    >
                      {option.key}: {option.value}
                    </Text>
                  ),
              )}
            </div>
          )}

          <div className="grid">
            {
              sellingPlanAllocation?.sellingPlan ? (
                <Text
                  color="subtle"
                  className="text-sm opacity-60"
              >
                {sellingPlanAllocation?.sellingPlan.name}
              </Text>
              ) : null
            }
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex justify-start text-copy">
              <CartLineQuantityAdjust line={line} />
            </div>
            <ItemRemoveButton lineId={id} disabled={!!isOptimistic} />
          </div>
        </div>
        <Text className="font-bold">
          <CartLinePrice line={line} as="span" />
        </Text>
      </div>
    </li>
  );
}

function ItemRemoveButton({
  lineId,
  disabled,
}: {
  lineId: CartLine['id'];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{
        lineIds: [lineId],
      }}
    >
      <button
        className="flex items-center justify-center w-10 h-10 border rounded"
        type="submit"
        disabled={disabled}
      >
        <span className="sr-only">Remove</span>
        <IconRemove aria-hidden="true" />
      </button>
    </CartForm>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {

  if (!line || typeof line?.quantity === 'undefined') return null;

  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="flex items-center border rounded">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="w-10 h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10"
            value={prevQuantity}
            disabled={quantity <= 1 || !!isOptimistic}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div className="px-2 text-center" data-test="item-quantity">
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="w-10 h-10 transition text-primary/50 hover:text-primary"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
            disabled={!!isOptimistic}
          >
            <span>&#43;</span>
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines,
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) {
    return(
      <div className="bg-gray-100 min-w-14">&nbsp;</div>
    )
  };

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);
  const {t} = useTranslation();
  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-6">
        <Text format>{t('cart.empty')}</Text>
        <div>
          <Button onClick={onClose}>{t('global.continueShopping')}</Button>
        </div>
      </section>
      <section className="grid gap-8 pt-16">
        <FeaturedProducts
          count={4}
          heading={t('global.shopBestSellers')}
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        />
      </section>
    </div>
  );
}
