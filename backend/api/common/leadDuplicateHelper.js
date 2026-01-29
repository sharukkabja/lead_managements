const normalizeEmail = (email = '') => {
  email = email.toLowerCase().trim();

  if (email.endsWith('@gmail.com')) {
    const [local, domain] = email.split('@');
    return `${local.replace(/\./g, '')}@${domain}`;
  }

  return email;
};

const normalizePhone = (phone = '') => {
  return phone
    .replace(/\D/g, '')   
    .replace(/^91/, '')  
    .slice(-10);      
};

const normalizeName = (name = '') => {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

module.exports = {
  normalizeEmail,
  normalizePhone,
  normalizeName,
};
