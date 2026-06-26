import React from 'react';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <section className={styles.storySection}>
        <h1 className={styles.title}>Our story</h1>
        <div className={styles.storyText}>
          <p>
            We believe in good. We launched Fresh Pan Pizza Best Excuse Awards on our Facebook fan page. Fans were given situations where they had to come up with wacky and fun excuses. The person with the best excuse won the Best Excuse Badge and won Pizzeria's vouchers. Their enthusiastic response proved that Pizzeria's Fresh Pan Pizza is the Tastiest Pan Pizza. Ever!
          </p>
          <p>
            Ever since we launched the Tastiest Pan Pizza, ever, people have not been able to resist the softest, cheesiest, crunchiest, butteriest Domino's Fresh Pan Pizza. They have been leaving the stage in the middle of a performance and even finding excuses to be disqualified in a football match.
          </p>
          <p>
            We launched Fresh Pan Pizza Best Excuse Awards on our Facebook fan page. Fans were given situations where they had to come up with wacky and fun excuses. The person with the best excuse won the Best Excuse Badge and won Domino's vouchers. Their enthusiastic response proved that Pizzeria's Fresh Pan Pizza is the Tastiest Pan Pizza. Ever!
          </p>
        </div>
      </section>

      {/* Ingredients Row */}
      <div className={styles.row}>
        <div className={styles.colImage}>
          <img
            src="/pizza_about_story.png"
            alt="Fresh Pizza Ingredients"
            className={styles.sectionImage}
          />
        </div>
        <div className={styles.colText}>
          <h2 className={styles.sectionHeading}>Ingredients</h2>
          <p className={styles.sectionDesc}>
            We're ruthless about goodness. We have no qualms about tearing up a day-old lettuce leaf (straight from the farm), or steaming a baby (carrot). Cut. Cut. Chop. Chop. Steam. Steam. Stir. Stir. While they're still young and fresh - that's our motto. It makes the kitchen a better place.
          </p>
        </div>
      </div>

      {/* Our Chefs Row */}
      <div className={`${styles.row} ${styles.rowReverse}`}>
        <div className={styles.colImage}>
          <img
            src="/chef.png"
            alt="Our Chef"
            className={styles.sectionImage}
          />
        </div>
        <div className={styles.colText}>
          <h2 className={styles.sectionHeading}>Our Chefs</h2>
          <p className={styles.sectionDesc}>
            They make sauces sing and salads dance. They create magic with skill, knowledge, passion, and stirring spoons (among other things). They make goodness so good, it doesn't know what to do with itself. We do though. We send it to you.
          </p>
        </div>
      </div>

      {/* Delivery Row */}
      <div className={styles.row}>
        <div className={styles.colImage}>
          <img
            src="/stopwatch.png"
            alt="45 min delivery stopwatch"
            className={styles.stopwatchImage}
          />
        </div>
        <div className={styles.colText} style={{ justifyContent: 'center' }}>
          <h2 className={styles.deliveryText}>45 min delivery</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;
