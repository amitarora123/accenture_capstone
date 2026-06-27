import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectCartItems,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../../store/cartSlice';
import { Trash2, ChevronDown, ChevronUp, Tag, Percent } from 'lucide-react';
import { addOrder } from '../../store/ordersSlice';
import styles from './CartCheckout.module.css';

interface FormState {
  name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export const CartCheckout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  // Expanded state for the ingredients dropdown in the bill breakdown
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  
  // Billing form state
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Coupon / Promo Code States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);

  // Calculations
  const pizzaTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.basePrice,
    0
  );
  
  const sizeCrustTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.sizePrice + item.crustPrice),
    0
  );

  const ingredientsTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.toppingsPrice,
    0
  );

  const subTotal = pizzaTotal + sizeCrustTotal + ingredientsTotal;

  // Coupon calculations
  const getDiscountAmount = (): number => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon === 'PIZZA20') {
      return subTotal * 0.20;
    }

    if (appliedCoupon === 'FREEVEG') {
      // Sum prices of veggie toppings (ID is not 101 Pepperoni and not 107 Chicken)
      return cartItems.reduce((sum, item) => {
        const vegToppingsCost = item.selectedToppings
          .filter((t) => t.id !== '101' && t.id !== '107')
          .reduce((s, t) => s + t.price, 0);
        return sum + item.quantity * vegToppingsCost;
      }, 0);
    }

    if (appliedCoupon === 'BOGO') {
      const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty >= 2) {
        // Find the base price of the cheapest pizza in the cart
        const basePrices: number[] = [];
        cartItems.forEach((item) => {
          for (let i = 0; i < item.quantity; i++) {
            basePrices.push(item.basePrice);
          }
        });
        basePrices.sort((a, b) => a - b);
        return basePrices[0];
      }
    }

    return 0;
  };

  const discountAmount = getDiscountAmount();
  const grandTotal = subTotal - discountAmount;

  // Aggregate custom ingredients in the cart for the dropdown breakdown
  interface AggregatedTopping {
    name: string;
    unitPrice: number;
    totalPrice: number;
    quantity: number;
  }

  const getAggregatedToppings = (): AggregatedTopping[] => {
    const map: Record<string, AggregatedTopping> = {};
    cartItems.forEach((item) => {
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        item.selectedToppings.forEach((topping) => {
          const key = topping.id;
          if (map[key]) {
            map[key].quantity += item.quantity;
            map[key].totalPrice += topping.price * item.quantity;
          } else {
            map[key] = {
              name: topping.name,
              unitPrice: topping.price,
              totalPrice: topping.price * item.quantity,
              quantity: item.quantity,
            };
          }
        });
      }
    });
    return Object.values(map);
  };

  const aggregatedToppings = getAggregatedToppings();

  // Handlers
  const handleQtyChange = (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      dispatch(updateQuantity({ id, quantity: newQty }));
    }
  };

  const handleDelete = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (isSubmitted) {
      validateField(name, value);
    }
  };

  const validateField = (fieldName: string, value: string) => {
    const fieldErrors: FormErrors = { ...errors };

    if (fieldName === 'name') {
      if (!value.trim()) {
        fieldErrors.name = 'Name is required';
      } else {
        delete fieldErrors.name;
      }
    }

    if (fieldName === 'phone') {
      const phoneRegex = /^\d{10}$/;
      if (!value.trim()) {
        fieldErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(value.trim())) {
        fieldErrors.phone = 'Phone number must be exactly 10 digits';
      } else {
        delete fieldErrors.phone;
      }
    }

    if (fieldName === 'address') {
      if (!value.trim()) {
        fieldErrors.address = 'Address is required';
      } else if (value.trim().length < 10) {
        fieldErrors.address = 'Address must be at least 10 characters long';
      } else {
        delete fieldErrors.address;
      }
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const formErrors: FormErrors = {};
    const phoneRegex = /^\d{10}$/;

    if (!form.name.trim()) {
      formErrors.name = 'Name is required';
    }

    if (!form.phone.trim()) {
      formErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(form.phone.trim())) {
      formErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!form.address.trim()) {
      formErrors.address = 'Address is required';
    } else if (form.address.trim().length < 10) {
      formErrors.address = 'Address must be at least 10 characters long';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'PIZZA20') {
      setAppliedCoupon('PIZZA20');
      setCouponSuccess('PIZZA20 coupon applied! 20% discount added.');
    } else if (code === 'FREEVEG') {
      const vegToppings = cartItems.some((item) =>
        item.selectedToppings.some((t) => t.id !== '101' && t.id !== '107')
      );
      if (!vegToppings) {
        setCouponError('FREEVEG applied, but no veggie toppings found in your cart.');
        setAppliedCoupon('FREEVEG');
      } else {
        setAppliedCoupon('FREEVEG');
        setCouponSuccess('FREEVEG applied! Veg toppings are now free.');
      }
    } else if (code === 'BOGO') {
      const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty < 2) {
        setCouponError('BOGO requires at least 2 pizzas in your cart.');
      } else {
        setAppliedCoupon('BOGO');
        setCouponSuccess('BOGO applied! Cheapest pizza base is free.');
      }
    } else {
      setCouponError('Invalid coupon code. Try PIZZA20, FREEVEG, or BOGO.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
    setCouponCode('');
  };

  const handlePay = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Add pizzas before making a payment.');
      return;
    }

    setIsSubmitted(true);
    const isValid = validateForm();
    if (isValid) {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newOrder = {
        id: orderId,
        name: form.name,
        address: form.address,
        phone: form.phone,
        amount: grandTotal,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          crust: item.crust,
        })),
        status: 'received' as const,
        createdAt: new Date().toISOString(),
      };

      // Dispatch order to the store
      dispatch(addOrder(newOrder));

      // Redirect to the TrackOrder page with orderId query param
      navigate(`/track?orderId=${orderId}`);

      // Clear the cart upon placing the order
      dispatch(clearCart());
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    handleRemoveCoupon();
  };

  return (
    <div className={styles.container}>
      {/* Left Column: Cart items and Billing Form */}
      <div className={styles.leftCol}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>My Cart</h2>
          {cartItems.length === 0 ? (
            <p className={styles.emptyCartMessage}>Your cart is empty.</p>
          ) : (
            <div className={styles.cartList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />

                  <div className={styles.itemDetails}>
                    <div className={styles.itemNameRow}>
                      <span className={styles.itemName}>{item.name}</span>
                      <div
                        className={`${styles.indicator} ${
                          item.isVeg ? styles.veg : styles.nonveg
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      />
                    </div>
                    <div className={styles.itemOptionsLabel}>
                      {item.size} | {item.crust}
                    </div>
                    <span className={styles.itemPrice}>
                      ₹{(item.basePrice + item.toppingsPrice + item.sizePrice + item.crustPrice).toFixed(2)}
                    </span>

                    {item.selectedToppings.length > 0 && (
                      <div className={styles.customToppingsText}>
                        Toppings:{' '}
                        {item.selectedToppings.map((t) => t.name).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className={styles.qtyContainer}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                    >
                      -
                    </button>
                    <span className={styles.qtyDisplay}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.itemTotal}>
                    ₹{(item.quantity * (item.basePrice + item.toppingsPrice + item.sizePrice + item.crustPrice)).toFixed(2)}
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <div className={styles.subTotalText}>
                Sub Total : ₹{subTotal.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Billing Details Card */}
        {cartItems.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Billing Details</h2>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={styles.input}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  className={styles.input}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="address">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="Enter detailed delivery address"
                  className={`${styles.input} ${styles.textarea}`}
                  rows={3}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Checkout Breakdown & Coupons */}
      <div className={styles.rightCol}>
        {/* Promo Code Input Card */}
        {cartItems.length > 0 && (
          <div className={styles.card} style={{ marginBottom: '20px' }}>
            <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={18} /> Apply Promo Code
            </h2>
            <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
              <input
                type="text"
                placeholder="Enter coupon code..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                className={styles.couponInput}
              />
              {appliedCoupon ? (
                <button type="button" onClick={handleRemoveCoupon} className={styles.couponRemoveBtn}>
                  Remove
                </button>
              ) : (
                <button type="submit" className={styles.couponApplyBtn}>
                  Apply
                </button>
              )}
            </form>

            {couponError && <div className={styles.couponErrorMsg}>{couponError}</div>}
            {couponSuccess && <div className={styles.couponSuccessMsg}>{couponSuccess}</div>}

            <button
              onClick={() => setShowOffers(!showOffers)}
              className={styles.toggleOffersBtn}
            >
              {showOffers ? 'Hide Offers' : 'View Available Offers'}
            </button>

            {showOffers && (
              <div className={styles.offersContainer}>
                <div
                  className={styles.offerCard}
                  onClick={() => {
                    if (!appliedCoupon) {
                      setCouponCode('PIZZA20');
                      setAppliedCoupon('PIZZA20');
                      setCouponSuccess('PIZZA20 coupon applied! 20% discount added.');
                    }
                  }}
                >
                  <div className={styles.offerBadge}>PIZZA20</div>
                  <div className={styles.offerDesc}>Get flat 20% off on your total cart value!</div>
                </div>

                <div
                  className={styles.offerCard}
                  onClick={() => {
                    if (!appliedCoupon) {
                      setCouponCode('FREEVEG');
                      handleApplyCoupon();
                    }
                  }}
                >
                  <div className={styles.offerBadge}>FREEVEG</div>
                  <div className={styles.offerDesc}>All vegetarian toppings on DIY/customized pizzas are free.</div>
                </div>

                <div
                  className={styles.offerCard}
                  onClick={() => {
                    if (!appliedCoupon) {
                      setCouponCode('BOGO');
                      handleApplyCoupon();
                    }
                  }}
                >
                  <div className={styles.offerBadge}>BOGO</div>
                  <div className={styles.offerDesc}>Buy 1 Get 1 Free (cheapest pizza base free when buying 2+ pizzas).</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Bill Summary</h2>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Pizza Base + Crust</span>
            <span className={styles.summaryValue}>₹{(pizzaTotal + sizeCrustTotal).toFixed(2)}</span>
          </div>

          <div className={styles.summaryRow} style={{ flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <span
                className={`${styles.summaryLabel} ${styles.dropdownToggle}`}
                onClick={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
              >
                Ingredients {isIngredientsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
              <span className={styles.summaryValue}>₹{ingredientsTotal.toFixed(2)}</span>
            </div>

            {/* Expanded Toppings Details list */}
            {isIngredientsExpanded && (
              <div className={styles.ingredientsDropdown}>
                {aggregatedToppings.length === 0 ? (
                  <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
                    No toppings added.
                  </div>
                ) : (
                  aggregatedToppings.map((top) => (
                    <div key={top.name} className={styles.ingredientDetailRow}>
                      <span>
                        {top.name} {top.quantity > 1 ? `(x${top.quantity})` : ''}
                      </span>
                      <span>
                        {top.unitPrice > 0 ? `₹${top.totalPrice.toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {appliedCoupon && discountAmount > 0 && (
            <div className={styles.summaryRow} style={{ color: 'var(--veg-green)' }}>
              <span className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Percent size={14} /> Coupon ({appliedCoupon})
              </span>
              <span className={styles.summaryValue}>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className={styles.grandTotalRow}>
            <span>Total :</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.payBtn} onClick={handlePay}>
              Pay
            </button>
            <button className={styles.clearBtn} onClick={handleClearCart}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
