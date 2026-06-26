import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectCartItems,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../../store/cartSlice';
import { Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
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
  
  // Checkout success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Billing form state
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculations
  const pizzaTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.basePrice,
    0
  );
  
  const ingredientsTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.toppingsPrice,
    0
  );

  const grandTotal = pizzaTotal + ingredientsTotal;

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
      if (item.type === 'custom') {
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
    
    // Clear error dynamically as user types
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

  const handlePay = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Add pizzas before making a payment.');
      return;
    }

    setIsSubmitted(true);
    const isValid = validateForm();
    if (isValid) {
      setShowSuccessModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    dispatch(clearCart());
    setForm({ name: '', phone: '', address: '' });
    setIsSubmitted(false);
    navigate('/');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
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
                    <span className={styles.itemPrice}>₹{item.basePrice.toFixed(2)}</span>

                    {item.type === 'custom' && item.selectedToppings.length > 0 && (
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
                    ₹{(item.quantity * (item.basePrice + item.toppingsPrice)).toFixed(2)}
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
                Sub Total : ₹{grandTotal.toFixed(2)}
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
                  className={`${styles.input} styles.textarea`}
                  rows={3}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Checkout Breakdown */}
      <div className={styles.rightCol}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>The total amount of</h2>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Pizza</span>
            <span className={styles.summaryValue}>₹{pizzaTotal.toFixed(2)}</span>
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
                    No custom toppings added.
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

      {/* Order Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <CheckCircle2 size={40} />
            </div>
            <h3 className={styles.modalTitle}>Order Placed!</h3>
            <p className={styles.modalDesc}>
              Thank you, <strong>{form.name}</strong>! Your order totaling{' '}
              <strong>₹{grandTotal.toFixed(2)}</strong> has been successfully placed.
              Our chefs are preparing your pizzas, and they will be delivered to{' '}
              <em>{form.address}</em> within <strong>45 minutes</strong>.
            </p>
            <button className={styles.modalCloseBtn} onClick={handleCloseModal}>
              Go to Home Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartCheckout;
