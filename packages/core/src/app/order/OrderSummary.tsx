import { DigitalItem, LineItemMap, PhysicalItem, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, {FunctionComponent, ReactNode, useMemo, useState} from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { getVariantsDataFromItems } from '../common/utility/getCraftData';
import { ShopperCurrency as ShopperCurrency2 } from '../currency';

import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryHeader from './OrderSummaryHeader';
import { OrderSummaryItemProps } from './OrderSummaryItem';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';
import removeBundledItems from './removeBundledItems';

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    additionalLineItems?: ReactNode;
    hasSubscription?: boolean;
    cartSummary?: boolean;
}

const getBasePrice = async (items: any[], currencyCode: string, callback: (arg0: number) => void) => {
    const variants = await getVariantsDataFromItems(items, currencyCode);
    const store = currencyCode === "USD" ? "usa" : "global";

    let totalBasePrice = 0;

    for(const variant of variants.data) {
        if(!variant) return;
        
        const {
            variant: {globalVariantSku, usaVariantSku, supplyValue},
            defaultVariant: {supplyValue: productDefaultSupplyValue},
            bigCommercePricing: {price: {as_entered: productDefaultPricing}}
        } = variant;
        const variantSku = store === "global" ? globalVariantSku : usaVariantSku;
        const quantity = items.find((item) => item.sku.toLowerCase() === variantSku.toLowerCase())?.quantity;

        const markedUpPriceAmount = ((productDefaultPricing || 0) * (supplyValue || 1)) /
            (productDefaultSupplyValue || 1);

        totalBasePrice += markedUpPriceAmount * quantity;
    }

    // update state
    callback(totalBasePrice);
}

const SavingBanner: FunctionComponent<any> = props => {
    const { lineItems, amount, hasSubscription, currencyCode } = props;
    const [basePrice, setBasePrice] = useState<number>(amount);

    const items: OrderSummaryItemProps[] = [
        ...lineItems.physicalItems
            .slice()
            .sort((item: PhysicalItem) => item.variantId)
            .map(mapFromPhysical),
        ...lineItems.giftCertificates.slice().map(mapFromGiftCertificate),
        ...lineItems.digitalItems
            .slice()
            .sort((item: DigitalItem) => item.variantId)
            .map(mapFromDigital),
        ...(lineItems.customItems || []).map(mapFromCustom),
    ];

    getBasePrice(items, currencyCode, (calculatedBasePrice) => {
        setBasePrice(calculatedBasePrice)
    });

    const savingAmount = useMemo(() => {
        return parseFloat((basePrice - amount).toFixed(2));
    }, [basePrice, amount]);

    const savingPercent = useMemo(() => {
        return parseFloat((100-(100*amount/basePrice)).toFixed(1));
    }, [basePrice, amount]);

    return (
        <>{
            (savingAmount > 0)  && (
                <div className='saving-banner'>
                    <div className='banner-icon'>
                        <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.7 3.8341C20.7 2.98793 20.0128 2.30069 19.1673 2.30069L12.4772 2.30002C11.6326 2.30002 10.4564 2.789 9.85957 3.3842L2.74835 10.4954C2.15172 11.0914 2.15081 12.0668 2.74835 12.6636L10.3372 20.2532C10.9332 20.8491 11.9095 20.8491 12.5063 20.2532L12.5086 20.2555L19.6166 13.1437C20.2134 12.5468 20.7008 11.3698 20.7008 10.5259L20.7 3.8341ZM18.5325 12.0593L11.4213 19.1688L3.8324 11.5792L10.9436 4.46794C11.2521 4.16022 12.0398 3.8338 12.4761 3.8338L19.1682 3.83447V10.525C19.1672 10.9623 18.8408 11.7507 18.5324 12.0591L18.5325 12.0593Z" fill="white"/>
                            <path d="M17.6334 6.51667C17.6334 7.15172 17.1176 7.66757 16.4834 7.66757C15.8477 7.66667 15.3325 7.15172 15.3325 6.51667C15.3325 5.88252 15.8477 5.36757 16.4825 5.36667C17.1176 5.36757 17.6334 5.88185 17.6334 6.51667Z" fill="white"/>
                            <path d="M14.539 9.54749L14.4035 9.41182L15.0809 8.73447L14.2678 7.92138L13.5904 8.59806L13.4557 8.4633C12.7068 7.71467 11.4926 7.71467 10.7446 8.4633C9.99572 9.21193 9.99572 10.4248 10.7446 11.1737L11.8285 12.2576C12.1282 12.558 12.1282 13.0424 11.8285 13.3426C11.5291 13.6423 11.044 13.6423 10.7446 13.3426L9.65963 12.2576C9.35992 11.9581 9.35992 11.4731 9.65963 11.1737L8.84654 10.3606C8.0977 11.1092 8.0977 12.3227 8.84654 13.0717L8.98198 13.2071L8.3044 13.8847L9.11749 14.6978L9.79574 14.0202L9.93051 14.1557C10.6793 14.9045 11.8936 14.9045 12.6416 14.1557C13.3905 13.407 13.3905 12.1936 12.6416 11.4445L11.5577 10.3606C11.258 10.0609 11.258 9.57579 11.5577 9.27638C11.8571 8.9769 12.3429 8.9769 12.6416 9.27638L13.7266 10.3606C14.0263 10.66 14.0263 11.1451 13.7266 11.4445L14.5389 12.2576C15.2877 11.5097 15.2877 10.2961 14.539 9.54765L14.539 9.54749Z" fill="white"/>
                        </svg>
                    </div>
                    <div className='banner-text'>You’re saving <ShopperCurrency2 amount={ savingAmount } />{hasSubscription && " every month"}, that’s {savingPercent}% off!</div>
                </div>)
        }


        </>

    );
};

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    isTaxIncluded,
    taxes,
    storeCurrency,
    shopperCurrency,
    headerLink,
    cartSummary = false,
    additionalLineItems,
    lineItems,
    total,
    hasSubscription,
    ...orderSummarySubtotalsProps
}) => {
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);
    const displayInclusiveTax = false; // isTaxIncluded && taxes && taxes.length > 0;

    return (
        <article className="cart optimizedCheckout-orderSummary" data-test="cart">
            <OrderSummaryHeader>
                {headerLink}
                {cartSummary && <div className={`payments-method ${!hasSubscription ? 'full-method' : ''}`}>
                    <div className="payment-icon visacard-icon" />
                    <div className="payment-icon diners-icon" />
                    <div className="payment-icon mastercard-icon" />
                    <div className="payment-icon amex-icon" />
                    <div className="payment-icon discover-icon" />
                    <div className="payment-icon jcb-icon" />
                    {   !hasSubscription &&
                        (<><div className="payment-icon paypal-icon" /><div className="payment-icon gpay-icon" /></>)
                    }

                </div>}
            </OrderSummaryHeader>

            <OrderSummarySection>
                <OrderSummaryItems displayLineItemsCount currency={storeCurrency} items={nonBundledLineItems} />
            </OrderSummarySection>

            <OrderSummarySection>
                { orderSummarySubtotalsProps.coupons.length === 0
                    && <SavingBanner amount={total} currencyCode={shopperCurrency.code} hasSubscription={hasSubscription} lineItems={lineItems} />}
                <OrderSummarySubtotals isTaxIncluded={isTaxIncluded} taxes={taxes} {...orderSummarySubtotalsProps} currencyCode={storeCurrency.code} />
                {additionalLineItems}
            </OrderSummarySection>

            <OrderSummarySection>
                <OrderSummaryTotal
                    orderAmount={total}
                    shippingAmount={orderSummarySubtotalsProps.shippingAmount}
                    lineItems={nonBundledLineItems}
                    shopperCurrencyCode={shopperCurrency.code}
                    storeCurrencyCode={storeCurrency.code}
                />
            </OrderSummarySection>

            {displayInclusiveTax && <OrderSummarySection>
                <h5
                    className="cart-taxItem cart-taxItem--subtotal optimizedCheckout-contentPrimary"
                    data-test="tax-text"
                >
                    <TranslatedString
                        id="tax.inclusive_label"
                    />
                </h5>
                {(taxes || []).map((tax, index) => (
                    <OrderSummaryPrice
                        amount={tax.amount}
                        currencyCode={storeCurrency.code}
                        key={index}
                        label={tax.name}
                        testId="cart-taxes"
                    />
                ))}
            </OrderSummarySection>}
            
            { hasSubscription && <section className="cart-section cart-subscription optimizedCheckout-orderSummary-cartSection">
                <div data-test="cart-total">
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary cart-priceItem--total">
                    <span className="cart-priceItem-label">
                        <span data-test="cart-price-label">
                            Your order contains a recurring subscription. You can cancel any time.
                        </span>
                    </span>
                    </div>
                </div>
            </section> }
        </article>
    );
};

export default OrderSummary;
