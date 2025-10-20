export function nameToHex(name: string) {
  const findColor = colors.find(
    (color) => color.name.toLowerCase() === name.toLowerCase(),
  );

  return findColor ? findColor.hex : undefined;
}

export const colors = [
  {name: 'Black', hex: '#000000'},
  {name: 'White', hex: '#FFFFFF'},
  {name: 'Silver', hex: '#C0C0C0'},
  {name: 'Grey', hex: '#585858'},
  {name: 'Blue', hex: '#0000FF'},
  {name: 'Green', hex: '#32CD32'},
  {name: 'Red', hex: '#FF0000'},
  {name: 'Clear', hex: '#F4FAFC'},
  {name: 'Brown', hex: '#964B00'},
  {name: 'Pink', hex: '#ffc0cb'},
  {name: 'Yellow', hex: '#FFFF00'},
  {name: 'Tan', hex: '#d2b48c'},
  {name: 'Orange', hex: '#FFA500'},
  {name: 'Purple', hex: '#9F2B68'},
  {name: 'Animal', hex: '#7a6961'},
  {name: 'Gold', hex: '#FFD700'},
  {name: 'Gravel', hex: '#4A4B46'},
  {name: 'Light Blue', hex: '#ADD8E6'},
];
