// utils/ createshipmentutils.js
export const calculateEstimate = (data: any): number => {
  const { items, priority, insuranceRequired, signatureRequired, temperatureControlled, fragile } = data;

  const totalWeight = items.reduce((sum: number, item: any) => 
    sum + (item.weight || 0) * (item.quantity || 1), 0);

  const totalValue = items.reduce((sum: number, item: any) => 
    sum + (item.value || 0) * (item.quantity || 1), 0);

  const baseRate = 2.5;
  const priorityMultiplier = priority === 'express' ? 2 : priority === 'overnight' ? 3 : 1;

  let estimate = totalWeight * baseRate * priorityMultiplier + 15;

  if (insuranceRequired && totalValue > 0) estimate += totalValue * 0.01;
  if (signatureRequired) estimate += 5;
  if (temperatureControlled) estimate += 25;
  if (fragile) estimate += 10;

  return Math.round(estimate * 100) / 100;
};