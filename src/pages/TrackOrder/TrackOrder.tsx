import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import {
  ClipboardCheck,
  ChefHat,
  Flame,
  Bike,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  ArrowLeft,
} from 'lucide-react';
import styles from './TrackOrder.module.css';

const STAGES = [
  { label: 'Order Received', desc: 'We have received your order.', icon: ClipboardCheck, statusKey: 'received' },
  { label: 'Preparing', desc: 'Our chefs are spinning the fresh dough.', icon: ChefHat, statusKey: 'preparing' },
  { label: 'Baking', desc: 'Your pizza is baking in our wood-fired oven.', icon: Flame, statusKey: 'baking' },
  { label: 'Out for Delivery', desc: 'Our rider is speeding to your address.', icon: Bike, statusKey: 'out_for_delivery' },
  { label: 'Delivered', desc: 'Enjoy your hot, fresh pizza!', icon: CheckCircle2, statusKey: 'delivered' },
];

export const TrackOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract orderId from search query parameter (?orderId=ORD-XXXXXX)
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  // Look up order in Redux store
  const orderData = useAppSelector((state) =>
    state.orders.items.find((o) => o.id === orderId)
  );

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'baking': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = orderData ? getStepIndex(orderData.status) : 0;
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  // Countdown timer effect (only ticks down if order is active and not delivered)
  useEffect(() => {
    if (!orderData || timeLeft <= 0 || orderData.status === 'delivered') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, orderData]);

  if (!orderData) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <h2>No Active Order Found</h2>
          <p>Please build your pizza and complete the checkout to track your order.</p>
          <button className={styles.goHomeBtn} onClick={() => navigate('/')}>
            Go to Menu
          </button>
        </div>
      </div>
    );
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Menu
      </button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Track Your Order</h1>
          <p className={styles.orderIdLabel}>Order ID: {orderData.id}</p>
        </div>
        <div className={styles.timerCard}>
          <span className={styles.timerLabel}>Estimated Delivery</span>
          <span className={styles.timerValue}>
            {orderData.status === 'delivered' ? 'Delivered! 🎉' : formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Stepper visualization */}
      <div className={styles.stepperCard}>
        <div className={styles.stepper}>
          {STAGES.map((stage, index) => {
            const IconComponent = stage.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={stage.label}
                className={`${styles.step} ${isCompleted ? styles.completed : ''} ${
                  isActive ? styles.active : ''
                }`}
              >
                <div className={styles.iconRing}>
                  <IconComponent
                    className={`${styles.icon} ${
                      isActive && stage.label === 'Baking' ? styles.flameAnimation : ''
                    } ${isActive && stage.label === 'Out for Delivery' ? styles.bikeAnimation : ''}`}
                    size={24}
                  />
                  {isCompleted && (
                    <div className={styles.checkmarkBadge}>
                      <CheckCircle2 size={12} fill="var(--veg-green)" color="#fff" />
                    </div>
                  )}
                </div>
                <div className={styles.stepInfo}>
                  <h3 className={styles.stepLabel}>{stage.label}</h3>
                  <p className={styles.stepDesc}>{stage.desc}</p>
                </div>
                {index < STAGES.length - 1 && (
                  <div
                    className={`${styles.connectorLine} ${
                      index < currentStep ? styles.connectorCompleted : ''
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order & Delivery Details */}
      <div className={styles.detailsGrid}>
        {/* Delivery Details */}
        <div className={styles.detailsCard}>
          <h2 className={styles.detailsTitle}>Delivery Details</h2>
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <User className={styles.detailIcon} size={18} />
              <div>
                <span className={styles.detailLabel}>Recipient</span>
                <span className={styles.detailValue}>{orderData.name}</span>
              </div>
            </div>
            <div className={styles.detailRow}>
              <Phone className={styles.detailIcon} size={18} />
              <div>
                <span className={styles.detailLabel}>Phone Number</span>
                <span className={styles.detailValue}>{orderData.phone}</span>
              </div>
            </div>
            <div className={styles.detailRow}>
              <MapPin className={styles.detailIcon} size={18} />
              <div>
                <span className={styles.detailLabel}>Address</span>
                <span className={styles.detailValue}>{orderData.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className={styles.detailsCard}>
          <h2 className={styles.detailsTitle}>Order Summary</h2>
          <div className={styles.itemsList}>
            {orderData.items.map((item, index) => (
              <div key={index} className={styles.orderItemRow}>
                <div className={styles.orderItemDetails}>
                  <span className={styles.orderItemName}>
                    {item.name} <span className={styles.orderItemQty}>x{item.quantity}</span>
                  </span>
                  <span className={styles.orderItemOptions}>
                    {item.size} | {item.crust}
                  </span>
                </div>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span>Total Paid</span>
              <span>₹{orderData.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
