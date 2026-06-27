import React, { useState } from 'react';
import type { Pizza, Topping } from '../../store/menuSlice';
import type { CartItem } from '../../store/cartSlice';
import { X } from 'lucide-react';
import styles from './CustomizeModal.module.css';

interface CustomizeModalProps {
  pizza: Pizza;
  isOpen: boolean;
  onClose: () => void;
  allToppings: Topping[];
  onAdd: (customizedPizza: Omit<CartItem, 'quantity'>) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  pizza,
  isOpen,
  onClose,
  allToppings,
  onAdd,
}) => {
  const [size, setSize] = useState<'Regular' | 'Medium' | 'Large'>('Regular');
  const [crust, setCrust] = useState<
    'New Hand Tossed' | 'Wheat Thin Crust' | 'Cheese Burst'
  >('New Hand Tossed');
  
  // Set default selected toppings to the toppings of this pizza
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>(() => {
    return allToppings.filter((t) => pizza.toppings.includes(t.name));
  });

  if (!isOpen) return null;

  const getSizePrice = (s: 'Regular' | 'Medium' | 'Large') => {
    if (s === 'Medium') return 100;
    if (s === 'Large') return 200;
    return 0;
  };

  const getCrustPrice = (c: string) => {
    if (c === 'Cheese Burst') return 75;
    return 0;
  };

  const sizePrice = getSizePrice(size);
  const crustPrice = getCrustPrice(crust);

  const getExtraToppingsPrice = () => {
    return selectedToppings
      .filter((t) => !pizza.toppings.includes(t.name))
      .reduce((sum, t) => sum + t.price, 0);
  };

  const toppingsPrice = getExtraToppingsPrice();
  const totalPrice = pizza.price + sizePrice + crustPrice + toppingsPrice;

  const handleToggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping]
    );
  };

  const handleAdd = () => {
    // Generate a configuration-specific ID so it can be distinguished in the cart
    const configId = `customized-${pizza.id}-${size}-${crust.replace(/\s+/g, '')}-${selectedToppings
      .map((t) => t.id)
      .sort()
      .join('-')}`;

    onAdd({
      id: configId,
      type: 'standard',
      name: `${pizza.name} (${size})`,
      basePrice: pizza.price,
      toppingsPrice,
      sizePrice,
      crustPrice,
      size,
      crust,
      image: pizza.image,
      isVeg: pizza.type === 'veg',
      selectedToppings,
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Customize {pizza.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Size Selection */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Select Size</h3>
            <div className={styles.optionsGrid}>
              {(['Regular', 'Medium', 'Large'] as const).map((s) => (
                <div
                  key={s}
                  className={`${styles.optionCard} ${
                    size === s ? styles.selected : ''
                  }`}
                  onClick={() => setSize(s)}
                >
                  <span className={styles.optionName}>{s}</span>
                  <span className={styles.optionPrice}>
                    {s === 'Regular' ? 'Base Price' : `+₹${getSizePrice(s)}`}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Crust Selection */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Select Crust</h3>
            <div className={styles.optionsGrid}>
              {(
                [
                  'New Hand Tossed',
                  'Wheat Thin Crust',
                  'Cheese Burst',
                ] as const
              ).map((c) => (
                <div
                  key={c}
                  className={`${styles.optionCard} ${
                    crust === c ? styles.selected : ''
                  }`}
                  onClick={() => setCrust(c)}
                >
                  <span className={styles.optionName}>{c}</span>
                  <span className={styles.optionPrice}>
                    {c === 'Cheese Burst'
                      ? `+₹${getCrustPrice(c)}`
                      : 'Free'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Extra Toppings */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Add Extra Toppings</h3>
            <div className={styles.toppingsList}>
              {allToppings.map((t) => {
                const isSelected = selectedToppings.some((st) => st.id === t.id);
                const isDefault = pizza.toppings.includes(t.name);

                return (
                  <div
                    key={t.id}
                    className={`${styles.toppingItem} ${
                      isSelected ? styles.toppingSelected : ''
                    }`}
                    onClick={() => handleToggleTopping(t)}
                  >
                    <div className={styles.toppingDetails}>
                      <span className={styles.toppingName}>
                        {t.name} {isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </span>
                      <span className={styles.toppingPrice}>
                        {isDefault ? 'Included' : `₹${t.price}`}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className={styles.checkbox}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.totalLabel}>Total Price</span>
            <span className={styles.totalAmount}>₹{totalPrice.toFixed(2)}</span>
          </div>
          <button className={styles.addBtn} onClick={handleAdd}>
            Add Customised Pizza
          </button>
        </footer>
      </div>
    </div>
  );
};
export default CustomizeModal;
