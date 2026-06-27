import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectPizzas, selectToppings } from '../../store/menuSlice';
import type { Pizza } from '../../store/menuSlice';
import { addToCart } from '../../store/cartSlice';
import CustomizeModal from '../../components/CustomizeModal/CustomizeModal';
import { Search } from 'lucide-react';
import styles from './OrderPizza.module.css';

export const OrderPizza = () => {
  const dispatch = useAppDispatch();
  const pizzas = useAppSelector(selectPizzas);
  const toppings = useAppSelector(selectToppings);

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Veg' | 'Non-Veg' | 'Spicy' | 'Cheesy'>('All');
  const [activeSort, setActiveSort] = useState<'Recommended' | 'PriceLow' | 'PriceHigh'>('Recommended');

  // Customize Modal state
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);

  const handleAddToCart = (pizza: Pizza) => {
    dispatch(
      addToCart({
        id: pizza.id,
        type: 'standard',
        name: pizza.name,
        basePrice: pizza.price,
        toppingsPrice: 0,
        sizePrice: 0,
        crustPrice: 0,
        size: 'Regular',
        crust: 'New Hand Tossed',
        image: pizza.image,
        isVeg: pizza.type === 'veg',
        selectedToppings: [],
      })
    );
  };

  const handleOpenCustomize = (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setIsCustomizeOpen(true);
  };

  // Helper to check if pizza has spicy ingredients/toppings
  const isSpicyPizza = (pizza: Pizza) => {
    const spicyKeywords = ['chili', 'peprika', 'jalapeno', 'pepperoni', 'spicy'];
    const textToSearch = [
      pizza.name,
      pizza.description,
      ...pizza.ingredients,
      ...pizza.toppings,
    ].join(' ').toLowerCase();
    return spicyKeywords.some((keyword) => textToSearch.includes(keyword));
  };

  // Helper to check if pizza has cheesy elements
  const isCheesyPizza = (pizza: Pizza) => {
    const cheesyKeywords = ['cheese', 'paneer', 'mozzarella', 'cheesy'];
    const textToSearch = [
      pizza.name,
      pizza.description,
      ...pizza.ingredients,
      ...pizza.toppings,
    ].join(' ').toLowerCase();
    return cheesyKeywords.some((keyword) => textToSearch.includes(keyword));
  };

  // Apply filters and search
  const filteredPizzas = pizzas
    .filter((pizza) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        pizza.name.toLowerCase().includes(query) ||
        pizza.description.toLowerCase().includes(query) ||
        pizza.ingredients.some((i) => i.toLowerCase().includes(query)) ||
        pizza.toppings.some((t) => t.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Category Filter
      if (activeCategory === 'Veg' && pizza.type !== 'veg') return false;
      if (activeCategory === 'Non-Veg' && pizza.type !== 'non-veg') return false;
      if (activeCategory === 'Spicy' && !isSpicyPizza(pizza)) return false;
      if (activeCategory === 'Cheesy' && !isCheesyPizza(pizza)) return false;

      return true;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (activeSort === 'PriceLow') {
        return a.price - b.price;
      }
      if (activeSort === 'PriceHigh') {
        return b.price - a.price;
      }
      return 0; // 'Recommended' keeps default API order
    });

  return (
    <div className={styles.container}>
      {/* Search, Filter & Sort Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search pizza, ingredients or toppings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilters}>
          {(['All', 'Veg', 'Non-Veg', 'Spicy', 'Cheesy'] as const).map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${
                activeCategory === cat ? styles.activeFilter : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.sortWrapper}>
          <label htmlFor="sort" className={styles.sortLabel}>Sort By:</label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="Recommended">Recommended</option>
            <option value="PriceLow">Price: Low to High</option>
            <option value="PriceHigh">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filteredPizzas.length === 0 ? (
        <div className={styles.noResults}>
          <h3>No Pizzas Found</h3>
          <p>Try resetting your search query or filters.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPizzas.map((pizza) => (
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
                  <span className={styles.price}>₹{pizza.price}</span>
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
                <div className={styles.actionButtons}>
                  <button
                    className={styles.addButton}
                    onClick={() => handleAddToCart(pizza)}
                  >
                    Add
                  </button>
                  <button
                    className={styles.customizeButton}
                    onClick={() => handleOpenCustomize(pizza)}
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPizza && (
        <CustomizeModal
          pizza={selectedPizza}
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          allToppings={toppings}
          onAdd={(customItem) => dispatch(addToCart(customItem))}
        />
      )}
    </div>
  );
};

export default OrderPizza;
