import React, { ComponentType, FunctionComponent } from 'react';

import { OrderSummaryProps, OrderSummarySubtotalsProps } from '../order';

import { WithCheckoutCartSummaryProps } from './CartSummary';
import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import Redeemable from './Redeemable';

export default function withRedeemable(
    OriginalComponent: ComponentType<OrderSummaryProps & OrderSummarySubtotalsProps>,
): FunctionComponent<WithCheckoutCartSummaryProps & { headerLink?: any } & { cartSummary?: boolean }> {
    return (props) => {
        const {
            checkout,
            storeCurrency,
            shopperCurrency,
            headerLink,
            cartSummary,
            onRemovedCoupon,
            onRemovedGiftCertificate,
            storeCreditAmount,
            hasSubscription,
            isUpdatedCartSummayModal = false,
            ...redeemableProps  
        } = props;

        return (
            <OriginalComponent
                {...mapToOrderSummarySubtotalsProps(checkout)}
                additionalLineItems={
                    <Redeemable
                        {...{
                            ...redeemableProps,
                            onRemovedCoupon,
                            onRemovedGiftCertificate,
                        }}
                    />
                }
                cartSummary={cartSummary}
                hasSubscription={hasSubscription}
                headerLink={headerLink}
                isUpdatedCartSummayModal={isUpdatedCartSummayModal}
                lineItems={checkout.cart.lineItems}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shopperCurrency={shopperCurrency}
                storeCreditAmount={storeCreditAmount}
                storeCurrency={storeCurrency}
                total={checkout.outstandingBalance}
            />
        );
    };
}
