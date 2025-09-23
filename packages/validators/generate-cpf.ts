// Generate valid CPF
function generateValidCPF() {
  // Generate first 9 digits
  const digits = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  digits.push(remainder);
  
  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  digits.push(remainder);
  
  const cpf = digits.join('');
  const formattedCPF = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  
  console.log(`Generated CPF: ${formattedCPF}`);
  console.log(`Clean CPF: ${cpf}`);
  
  return formattedCPF;
}

generateValidCPF();