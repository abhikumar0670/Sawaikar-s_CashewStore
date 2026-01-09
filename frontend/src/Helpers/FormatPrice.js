const FormatPrice = ({price}) => {
  // Handle undefined/null prices
  if (!price && price !== 0) {
    return "₹0.00";
  }

  // Convert price from paise to rupees (89900 paise = ₹899.00)
  const priceInRupees = price / 100;
  
  return (
    Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(priceInRupees)
  );
};

export default FormatPrice;
