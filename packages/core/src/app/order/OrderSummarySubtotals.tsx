import { Coupon, Fee, GiftCertificate, OrderFee, Tax } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import OrderSummaryDiscount from './OrderSummaryDiscount';
import OrderSummaryPrice from './OrderSummaryPrice';
import isOrderFee from "./isOrderFee";

export interface OrderSummarySubtotalsProps {
    coupons: Coupon[];
    giftCertificates?: GiftCertificate[];
    discountAmount?: number;
    isTaxIncluded?: boolean;
    taxes?: Tax[];
    fees?: Fee[] | OrderFee[];
    giftWrappingAmount?: number;
    isUpdatedCartSummayModal?: boolean,
    shippingAmount?: number;
    handlingAmount?: number;
    storeCreditAmount?: number;
    subtotalAmount: number;
    currencyCode?: string;
    onRemovedGiftCertificate?(code: string): void;
    onRemovedCoupon?(code: string): void;
}

const OrderSummarySubtotals: FunctionComponent<OrderSummarySubtotalsProps> = ({
    discountAmount,
    isTaxIncluded,
    giftCertificates,
    taxes,
    fees,
    giftWrappingAmount,
    shippingAmount,
    subtotalAmount,
    handlingAmount,
    storeCreditAmount,
    coupons,
    currencyCode,
    onRemovedGiftCertificate,
    onRemovedCoupon,
}) => {
    return (
        <>
            <OrderSummaryPrice
                amount={subtotalAmount}
                className="cart-priceItem--subtotal"
                currencyCode={currencyCode}
                label={<TranslatedString id="cart.subtotal_text" />}
                testId="cart-subtotal"
            />

            {(coupons || []).map((coupon, index) => (
                <OrderSummaryDiscount
                    amount={coupon.discountedAmount}
                    code={coupon.code}
                    key={index}
                    label={coupon.displayName === "Coupon Discount" ? "Coupon discount" : coupon.displayName}
                    onRemoved={onRemovedCoupon}
                    currencyCode={currencyCode}
                    testId="cart-coupon"
                />
            ))}

            {!!discountAmount && (
                <OrderSummaryDiscount
                    amount={discountAmount}
                    label={<TranslatedString id="cart.discount_text" />}
                    currencyCode={currencyCode}
                    testId="cart-discount"
                />
            )}

            {(giftCertificates || []).map((giftCertificate, index) => (
                <OrderSummaryDiscount
                    amount={giftCertificate.used}
                    code={giftCertificate.code}
                    key={index}
                    label={<TranslatedString id="cart.gift_certificate_text" />}
                    onRemoved={onRemovedGiftCertificate}
                    remaining={giftCertificate.remaining}
                    currencyCode={currencyCode}
                    testId="cart-gift-certificate"
                />
            ))}

            {!!giftWrappingAmount && (
                <OrderSummaryPrice
                    amount={giftWrappingAmount}
                    label={<TranslatedString id="cart.gift_wrapping_text" />}
                    testId="cart-gift-wrapping"
                />
            )}

            <OrderSummaryPrice
                amount={shippingAmount ?? "Calculated at next step"}
                label={<TranslatedString id="cart.shipping_text" />}
                testId="cart-shipping"
                zeroLabel={<TranslatedString id="cart.free_text" />}
            />

            {!!handlingAmount && (
                <OrderSummaryPrice
                    amount={handlingAmount}
                    label={<TranslatedString id="cart.handling_text" />}
                    testId="cart-handling"
                />
            )}

            {fees?.map((fee, index) => (
                <OrderSummaryPrice
                    amount={fee.cost}
                    key={index}
                    label={isOrderFee(fee) ? fee.customerDisplayName : fee.displayName}
                    testId="cart-fees"
                />
            ))}

            {!isTaxIncluded && (taxes || []).map((tax, index) => (
                <OrderSummaryPrice
                    amount={tax.amount}
                    key={index}
                    label={tax.name}
                    testId="cart-taxes"
                />
            ))}

            {!!storeCreditAmount && (
                <OrderSummaryDiscount
                    amount={storeCreditAmount}
                    label={<TranslatedString id="cart.store_credit_text" />}
                    currencyCode={currencyCode}
                    testId="cart-store-credit"
                />
            )}
        </>
    );
};

export default memo(OrderSummarySubtotals);
