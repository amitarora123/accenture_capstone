import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectToppings } from '../../store/menuSlice';
import { addToCart } from '../../store/cartSlice';
import styles from './BuildPizza.module.css';

const TOPPING_EMOJIS: Record<string, string> = {
  '101': '🍕', // Pepperoni
  '102': '🍄', // Mushroom
  '103': '🫘', // Black beans
  '104': '🫒', // Black olive
  '105': '🫒', // Green olive
  '106': '🌶️', // Jalapeno
  '107': '🍗', // Chicken
  '108': '🍅', // Tomato
  '119': '🌶️', // Red peprika
  '110': '🧀', // Paneer
  '111': '🧅', // Fried Onion
  '112': '🫑', // Capsicum
  '114': '🌽', // Sweet corn
};

// Static coordinate layout for scattering toppings on the pizza canvas
const TOPPING_COORDINATES = [
  { top: '25%', left: '35%' },
  { top: '30%', left: '60%' },
  { top: '55%', left: '25%' },
  { top: '65%', left: '50%' },
  { top: '40%', left: '45%' },
  { top: '50%', left: '68%' },
  { top: '20%', left: '50%' },
  { top: '68%', left: '33%' },
];

export const BuildPizza: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toppings = useAppSelector(selectToppings);

  // Default size and crust states
  const [size, setSize] = useState<'Regular' | 'Medium' | 'Large'>('Regular');
  const [crust, setCrust] = useState<
    'New Hand Tossed' | 'Wheat Thin Crust' | 'Cheese Burst'
  >('New Hand Tossed');

  const defaultCheckedIds = toppings
    .filter((t) => t.defaultChecked)
    .map((t) => t.id);

  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>(
    defaultCheckedIds.length > 0 ? defaultCheckedIds : ['107', '108']
  );

  const handleToggleTopping = (id: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const PIZZA_BASE_PRICE = 50;

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

  const toppingsCost = toppings
    .filter((t) => selectedToppingIds.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  const totalCost = PIZZA_BASE_PRICE + toppingsCost + sizePrice + crustPrice;

  const handleBuildPizza = () => {
    const selectedToppingsList = toppings.filter((t) =>
      selectedToppingIds.includes(t.id)
    );

    if (selectedToppingsList.length === 0) {
      alert('Please select at least one ingredient to build your pizza.');
      return;
    }

    const hasMeat = selectedToppingIds.some(
      (id) => id === '107' || id === '101'
    );

    dispatch(
      addToCart({
        id: `custom-${Date.now()}`,
        type: 'custom',
        name: `DIY Pizza (${size})`,
        basePrice: PIZZA_BASE_PRICE,
        toppingsPrice: toppingsCost,
        sizePrice,
        crustPrice,
        size,
        crust,
        image: '/pizza_menu_default.png',
        isVeg: !hasMeat,
        selectedToppings: selectedToppingsList,
      })
    );

    navigate('/cart');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Build Ur Pizza</h1>
      <p className={styles.subtitle}>
        Pizzeria now gives you options to build your own pizza. Customize your pizza by choosing ingredients from the list given below
      </p>

      <div className={styles.workspace}>
        {/* Left Column: Visual Pizza Canvas & Configurations */}
        <div className={styles.leftCol}>
          <div className={styles.canvasCard}>
            <div className={`${styles.pizzaBase} ${styles[size.toLowerCase()]} ${crust === 'Cheese Burst' ? styles.cheeseBurstBorder : ''}`}>
              {/* Pizza Crust Outer Ring */}
              <div className={styles.pizzaCrust}>
                {/* Pizza Sauce and Cheese Layer */}
                <div className={styles.pizzaCheese}>
                  {/* Selected Toppings Rendered on Pizza */}
                  {selectedToppingIds.map((id, toppingIndex) => {
                    const emoji = TOPPING_EMOJIS[id] || '🥗';
                    // Spread the toppings emojis across predefined coordinates
                    return TOPPING_COORDINATES.slice(0, 4).map((coords, i) => (
                      <span
                        key={`${id}-${i}`}
                        className={styles.sprinkledTopping}
                        style={{
                          top: coords.top,
                          left: coords.left,
                          // Introduce slight rotation/variation for realism
                          transform: `translate(-50%, -50%) rotate(${(toppingIndex * 45 + i * 90) % 360}deg) scale(1.2)`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      >
                        {emoji}
                      </span>
                    ));
                  })}
                </div>
              </div>
            </div>
            <div className={styles.canvasBadge}>
              Live Canvas Preview ({size} - {crust})
            </div>
          </div>

          {/* Size Selection */}
          <div className={styles.configCard}>
            <h3 className={styles.configTitle}>1. Choose Size</h3>
            <div className={styles.radioGroup}>
              {(['Regular', 'Medium', 'Large'] as const).map((s) => (
                <label key={s} className={`${styles.radioLabel} ${size === s ? styles.radioActive : ''}`}>
                  <input
                    type="radio"
                    name="size"
                    checked={size === s}
                    onChange={() => setSize(s)}
                    className={styles.radioInput}
                  />
                  <span>{s} {s !== 'Regular' ? `(+₹${getSizePrice(s)})` : ''}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Crust Selection */}
          <div className={styles.configCard}>
            <h3 className={styles.configTitle}>2. Choose Crust</h3>
            <div className={styles.radioGroup}>
              {(['New Hand Tossed', 'Wheat Thin Crust', 'Cheese Burst'] as const).map((c) => (
                <label key={c} className={`${styles.radioLabel} ${crust === c ? styles.radioActive : ''}`}>
                  <input
                    type="radio"
                    name="crust"
                    checked={crust === c}
                    onChange={() => setCrust(c)}
                    className={styles.radioInput}
                  />
                  <span>{c} {c === 'Cheese Burst' ? `(+₹75)` : ''}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Toppings Selector */}
        <div className={styles.rightCol}>
          <h3 className={styles.configTitle}>3. Choose Ingredients</h3>
          <table className={styles.table}>
            <tbody>
              {toppings.map((topping) => {
                const isChecked = selectedToppingIds.includes(topping.id);
                const emoji = TOPPING_EMOJIS[topping.id] || '🥗';

                return (
                  <tr key={topping.id} className={styles.row}>
                    <td className={styles.tdImg}>
                      <div className={styles.iconWrapper}>{emoji}</div>
                    </td>
                    
                    <td className={styles.tdNamePrice}>
                      <span className={styles.toppingName}>{topping.name}</span>
                      {topping.id === 'black-olive' ? (
                        <span className={styles.toppingPrice}></span>
                      ) : (
                        <span className={styles.toppingPrice}>₹{topping.price.toFixed(2)}</span>
                      )}
                    </td>

                    <td className={styles.tdAction}>
                      <div
                        className={`${styles.actionWrapper} ${isChecked ? styles.actionActive : ''}`}
                        onClick={() => handleToggleTopping(topping.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Controlled by row click
                          className={styles.checkbox}
                        />
                        <span className={styles.addLabel}>{isChecked ? 'Added' : 'Add'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.totalSection}>
        Total Cost : ₹{totalCost.toFixed(2)}
      </div>

      <button className={styles.buildButton} onClick={handleBuildPizza}>
        Build Ur Pizza
      </button>
    </div>
  );
};

export default BuildPizza;
