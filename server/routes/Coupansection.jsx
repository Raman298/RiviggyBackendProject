/**
 * CouponSection.jsx
 * Plug-and-play coupon UI for your checkout page.
 *
 * Usage:
 *   import CouponSection from './CouponSection';
 *   import { useCoupon }  from './useCoupon';
 *
 *   const coupon = useCoupon(subtotal, isNewUser);
 *
 *   <CouponSection
 *     subtotal={subtotal}
 *     isNewUser={isNewUser}
 *     {...coupon}
 *   />
 */

import React from 'react';
import { COUPONS, calculateDiscount } from './couponData';   // ES-module version for React
import './CouponSection.css';

// ── Atoms ─────────────────────────────────────────────────────────────────────

function Badge({ text, variant = 'default' }) {
  return <span className={`cs-badge cs-badge--${variant}`}>{text}</span>;
}

function Message({ type, text }) {
  if (!text) return null;
  return (
    <div className={`cs-message cs-message--${type}`} role="alert">
      <span className="cs-message__icon">{type === 'success' ? '✓' : '✕'}</span>
      {text}
    </div>
  );
}

// ── Coupon card ───────────────────────────────────────────────────────────────

function CouponCard({ coupon, subtotal, isNewUser, isSelected, onSelect }) {
  const disc = calculateDiscount(coupon, subtotal, isNewUser);
  const ineligible = disc === 0 && coupon.minOrder > 0 && subtotal < coupon.minOrder;
  const newUserBlock = coupon.forNewUser && !isNewUser;
  const disabled = ineligible || newUserBlock;

  const badgeVariant =
    coupon.forNewUser     ? 'new'
    : coupon.type === 'flat' ? 'flat'
    : coupon.badge === 'Group' ? 'group'
    : 'percent';

  return (
    <button
      className={[
        'cs-card',
        isSelected        ? 'cs-card--selected'  : '',
        disabled          ? 'cs-card--disabled'  : '',
        coupon.forNewUser ? 'cs-card--new-user'  : '',
      ].filter(Boolean).join(' ')}
      onClick={() => !disabled && onSelect(coupon)}
      disabled={disabled}
      aria-pressed={isSelected}
      type="button"
    >
      {isSelected && (
        <span className="cs-card__check" aria-label="Applied">✓</span>
      )}

      <Badge text={coupon.badge} variant={badgeVariant} />

      <p className="cs-card__code">{coupon.code}</p>
      <p className="cs-card__desc">{coupon.description}</p>

      <p className="cs-card__savings">
        {disabled
          ? newUserBlock
            ? 'New users only'
            : `Min order ₹${coupon.minOrder}`
          : `Saves ₹${disc}`}
      </p>

      <p className="cs-card__expiry">🕐 {coupon.expiryLabel}</p>
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * CouponSection
 *
 * Props: everything returned by useCoupon() spread in, plus:
 *   subtotal  {number}
 *   isNewUser {boolean}
 */
export function CouponSection({
  subtotal,
  isNewUser,
  appliedCoupon,
  inputCode,
  setInputCode,
  message,
  applyCoupon,
  removeCoupon,
  selectCoupon,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyCoupon();
  };

  return (
    <section className="cs-root" aria-label="Coupons and discounts">
      {/* ── Available coupon cards ── */}
      <p className="cs-section-label">Available coupons</p>

      <div className="cs-grid" role="list">
        {COUPONS.filter((c) => c.active).map((c) => (
          <div key={c.code} role="listitem">
            <CouponCard
              coupon={c}
              subtotal={subtotal}
              isNewUser={isNewUser}
              isSelected={appliedCoupon?.code === c.code}
              onSelect={selectCoupon}
            />
          </div>
        ))}
      </div>

      {/* ── Manual code entry ── */}
      <p className="cs-section-label cs-section-label--mt">Or enter a coupon code</p>

      <div className="cs-input-row">
        <input
          className="cs-input"
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="e.g. WELCOME50"
          aria-label="Coupon code"
          autoComplete="off"
          spellCheck={false}
        />
        {appliedCoupon ? (
          <button className="cs-btn cs-btn--remove" onClick={removeCoupon} type="button">
            Remove
          </button>
        ) : (
          <button className="cs-btn cs-btn--apply" onClick={() => applyCoupon()} type="button">
            Apply
          </button>
        )}
      </div>

      <Message type={message?.type} text={message?.text} />
    </section>
  );
}

export default CouponSection;