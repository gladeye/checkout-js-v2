import React, { FunctionComponent } from 'react';

import { TranslatedString, withCurrency, WithCurrencyProps } from '@bigcommerce/checkout/locale';

import OrderSummaryPrice from './OrderSummaryPrice';
import {LineItemMap} from "@bigcommerce/checkout-sdk";

export interface OrderSummaryTotalProps {
    orderAmount: number;
    shopperCurrencyCode: string;
    storeCurrencyCode: string;
    shippingAmount: number | undefined;
    lineItems: LineItemMap;
}

const OrderSummaryTotal: FunctionComponent<OrderSummaryTotalProps & WithCurrencyProps> = ({
    shopperCurrencyCode,
    storeCurrencyCode,
    orderAmount,
    currency,
    shippingAmount,
    lineItems,
}) => {
    const hasDifferentCurrency = shopperCurrencyCode !== storeCurrencyCode;
    const label = (
        <>
            {hasDifferentCurrency ? (
                <TranslatedString id="cart.estimated_total_text" />
            ) : (
                <TranslatedString id="cart.total_text" />
            )}
            {` (${shopperCurrencyCode})`}
        </>
    );

    return (
        <>
            <OrderSummaryPrice
                amount={orderAmount}
                currencyCode={storeCurrencyCode}
                className="cart-priceItem--total"
                label={label}
                superscript={hasDifferentCurrency ? '*' : undefined}
                testId="cart-total"
                lineItems={lineItems}
                shippingAmount={shippingAmount}
            />
            {hasDifferentCurrency && currency && (
                <p className="cart-priceItem--totalNote" data-test="cart-price-item-total-note">
                    <TranslatedString
                        data={{
                            total: currency.toStoreCurrency(orderAmount),
                            code: storeCurrencyCode,
                        }}
                        id="cart.billed_amount_text"
                    />
                </p>
            )}
        </>
    );
};

export default withCurrency(OrderSummaryTotal);
