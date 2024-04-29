import {DigitalItem, LineItemMap, PhysicalItem} from "@bigcommerce/checkout-sdk";
import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { checkHasSubscription } from '../common/utility/getCraftData';
import { ShopperCurrency } from '../currency';

import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import { OrderSummaryItemProps } from './OrderSummaryItem';

export interface OrderSummaryPriceProps {
    label: ReactNode;
    amount?: number | null;
    zeroLabel?: ReactNode;
    className?: string;
    testId?: string;
    currencyCode?: string;
    superscript?: string;
    actionLabel?: ReactNode;
    shippingAmount?: number | null;
    lineItems?: LineItemMap;
    onActionTriggered?(): void;
}

export interface OrderSummaryPriceState {
    highlight: boolean;
    previousAmount?: number;
}

function getDisplayValue(amount?: number | null, zeroLabel?: ReactNode): ReactNode | number {
    const notYetSetSymbol = '--';

    if (typeof amount === 'undefined' || amount === null) {
        return notYetSetSymbol;
    }

    if (zeroLabel && amount === 0) {
        return zeroLabel;
    }

    return amount;
}

function isNumberValue(displayValue: number | ReactNode): displayValue is number {
    return typeof displayValue === 'number';
}

const ConfidenceBlock: FC<any> = props => {

    const { lineItems, shippingAmount, currencyCode } = props;
    const [isFreeShipping, setIsFreeShipping] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [hasSubscriptionLoaded, setHasSubscriptionLoaded] = useState(false);

    const initialItems: OrderSummaryItemProps[] = [
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

    useEffect(() => {
        const calculateHasSubscription = async () => {
            const hasSubscriptionVariant = await checkHasSubscription(initialItems, currencyCode);

            setHasSubscription(hasSubscriptionVariant);
            setHasSubscriptionLoaded(true);
        }

        calculateHasSubscription()
    }, [initialItems]);

    useEffect(() => {
        setIsFreeShipping(shippingAmount === 0);
    }, [shippingAmount]);

    if(!hasSubscriptionLoaded) return null;

    return (
        <>
            { hasSubscription && <section className="payments cart-subscription cart-section optimizedCheckout-orderSummary-cartSection">
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
                <div className="payments">
                    {isFreeShipping && !hasSubscription && <div className="free-shipping">
                        Your order qualifies for free shipping!
                    </div>}
                    {hasSubscription && (
                        <><h2>Enjoy your MitoQ subscription with:</h2>
                            <ul className="benefit-list">
                                <li>Free shipping on all orders</li>
                                <li>Skip or pause subscription anytime</li>
                                <li>Cancel anytime</li>
                                <li>Scheduled shipping, direct to you</li>
                            </ul></>)
                    }
                    <div className={`payments-method ${!hasSubscription ? 'full-method' : ''}`}>
                        <div className="payment-icon visacard-icon"></div>
                        <div className="payment-icon diners-icon"></div>
                        <div className="payment-icon mastercard-icon"></div>
                        <div className="payment-icon amex-icon"></div>
                        <div className="payment-icon discover-icon"></div>
                        <div className="payment-icon jcb-icon"></div>
                        {   !hasSubscription &&
                            (<><div className="payment-icon paypal-icon"></div><div className="payment-icon gpay-icon"></div></>)
                        }

                    </div>
                </div>
            </>
    );
};

const OrderSummaryPrice: FC<OrderSummaryPriceProps> = ({
    amount,
    actionLabel,
    onActionTriggered,
    children,
    className,
    currencyCode,
    label,
    superscript,
    testId,
    zeroLabel,
    shippingAmount,
    lineItems,
}) => {
    const [ highlight, setHighlight ] = useState<boolean>(false);
    const [ previousAmount, setPreviousAmount ] = useState<OrderSummaryPriceProps['amount']>(amount);
    const {
        checkoutState: {
            statuses: { isSubmittingOrder }
        }
    } = useCheckout();

    const displayValue = getDisplayValue(amount, zeroLabel);
    const isActionDisabled = isSubmittingOrder();
    
    useEffect(() => {
        setHighlight(amount !== previousAmount);
        setPreviousAmount(amount);
    }, [ amount ]);

    const handleTransitionEnd: (node: HTMLElement, done: () => void) => void = useCallback((node, done) => {
        node.addEventListener('animationend', ({ target }) => {
            if (target === node) {
                setHighlight(false);
                done();
            }
        });
    }, [ setHighlight ]);

    const handleActionTrigger = () => {
        if (isActionDisabled || !onActionTriggered) {
            return;
        }

        onActionTriggered();
    }

    return (
        <div data-test={testId}>
            <CSSTransition
                addEndListener={handleTransitionEnd}
                classNames="changeHighlight"
                in={highlight}
                timeout={{}}
            >
                <div
                    aria-live="polite"
                    className={classNames(
                        'cart-priceItem',
                        'optimizedCheckout-contentPrimary',
                        className,
                    )}
                >
                    <span className="cart-priceItem-label">
                        <span data-test="cart-price-label">
                            {label}
                            {'  '}
                        </span>
                        {/* {currencyCode && (
                            <span className="cart-priceItem-currencyCode">
                                {`(${currencyCode}) `}
                            </span>
                        )} */}
                        {onActionTriggered && actionLabel && (
                            <span className="cart-priceItem-link">
                                <a
                                    className={classNames({
                                        'link--disabled': isActionDisabled,
                                    })}
                                    data-test="cart-price-callback"
                                    href="#"
                                    onClick={preventDefault(handleActionTrigger)}
                                >
                                    {actionLabel}
                                </a>
                            </span>
                        )}
                    </span>

                    <span className="cart-priceItem-value">
                        <span data-test="cart-price-value">
                            {isNumberValue(displayValue) ? (
                                <ShopperCurrency amount={displayValue} />
                            ) : (
                                displayValue
                            )}
                        </span>

                        {superscript && (
                            <sup data-test="cart-price-value-superscript">{superscript}</sup>
                        )}
                    </span>

                    {children}
                </div>
            </CSSTransition>
            {
                testId === 'cart-total' &&
                <ConfidenceBlock amount={amount} currencyCode={currencyCode} lineItems={lineItems} shippingAmount={shippingAmount} />
            }
        </div>
    );
};

export default OrderSummaryPrice;
