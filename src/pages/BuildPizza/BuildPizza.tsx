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

export const BuildPizza: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toppings = useAppSelector(selectToppings);

  // Set default toppings checked based on the screenshot: Chicken and Tomato are checked
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

  // Calculate live cost: sum up selected topping prices
  const toppingsCost = toppings
    .filter((t) => selectedToppingIds.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  const totalCost = PIZZA_BASE_PRICE + toppingsCost;

  const handleBuildPizza = () => {
    const selectedToppingsList = toppings.filter((t) =>
      selectedToppingIds.includes(t.id)
    );

    // If no toppings are selected, prevent adding (or allow, but let's notify user)
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
        name: 'Build Your Own Pizza',
        basePrice: PIZZA_BASE_PRICE,
        toppingsPrice: toppingsCost,
        image: '/pizza_menu_default.png',
        isVeg: !hasMeat,
        selectedToppings: selectedToppingsList,
      })
    );

    // Redirect to the cart page to view the added DIY pizza
    navigate('/cart');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Build Ur Pizza</h1>
      <p className={styles.subtitle}>
        Pizzeria now gives you options to build your own pizza. Customize your pizza by choosing ingredients from the list given below
      </p>

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
                  {/* Handle cases like Black olive which has a price but isn't showing in the screenshot */}
                  {topping.id === 'black-olive' ? (
                    <span className={styles.toppingPrice}></span>
                  ) : (
                    <span className={styles.toppingPrice}>₹{topping.price.toFixed(2)}</span>
                  )}
                </td>

                <td className={styles.tdAction}>
                  <div
                    className={styles.actionWrapper}
                    onClick={() => handleToggleTopping(topping.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Controlled by row wrapper click
                      className={styles.checkbox}
                    />
                    <span className={styles.addLabel}>Add</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.totalSection}>
        Total Cost : {totalCost}
      </div>

      <button className={styles.buildButton} onClick={handleBuildPizza}>
        Build Ur Pizza
      </button>
    </div>
  );
};

export default BuildPizza;
