import { useAppDispatch, useAppSelector } from '../../store';
import { selectPizzas } from '../../store/menuSlice';
import type { Pizza } from '../../store/menuSlice';
import { addToCart } from '../../store/cartSlice';
import styles from './OrderPizza.module.css';

export const OrderPizza = () => {
  const dispatch = useAppDispatch();
  const pizzas = useAppSelector(selectPizzas);

  const handleAddToCart = (pizza: Pizza) => {
    dispatch(
      addToCart({
        id: pizza.id,
        type: 'standard',
        name: pizza.name,
        basePrice: pizza.price,
        toppingsPrice: 0,
        image: pizza.image,
        isVeg: pizza.type === 'veg',
        selectedToppings: [],
      })
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {pizzas.map((pizza) => (
          <div key={pizza.id} className={styles.card}>
            <div className={styles.leftCol}>
              <h2 className={styles.pizzaName}>{pizza.name}</h2>
              <div className={styles.badgeAndPrice}>
                <div
                  className={`${styles.indicator} ${
                    pizza.type === 'veg' ? styles.veg : styles.nonveg
                  }`}
                  title={pizza.type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                />
                <span className={styles.price}>₹{pizza.price.toFixed(2)}</span>
              </div>
              <p className={styles.description}>{pizza.description}</p>
              
              <div className={styles.detailsList}>
                <div>
                  <span className={styles.detailLabel}>Ingredients: </span>
                  <span>{pizza.ingredients.join(', ')}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Toppings: </span>
                  <span>{pizza.toppings.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className={styles.rightCol}>
              <img src={pizza.image} alt={pizza.name} className={styles.pizzaImg} />
              <button
                className={styles.addButton}
                onClick={() => handleAddToCart(pizza)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPizza;
