export const CASH_APP_CONFIG = {
  displayName: "Hair Cutz Studio",
  cashTag: "$HairCutzStudio",
  instructions: "Send the exact amount via Cash App to the tag above. Include your name in the payment note for quick processing.",
  note: "Payment confirms your booking. We'll contact you once received.",
  supportPhone: "+234 XXX XXX XXXX",
  supportEmail: "info@haircutzstudio.com"
};

export const getFullCashTag = () => {
  const tag = CASH_APP_CONFIG.cashTag;
  return tag.startsWith("$") ? tag : "$" + tag;
};