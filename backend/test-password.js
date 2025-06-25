const { customValidators } = require('./src/middleware/validation');

const testPasswords = [
  'SecurePass123!',
  'StrongP@ssw0rd',
  'Complex123!@#',
  'MyStr0ng!Pass',
  'PowerfulP@55word'
];

console.log('Testing password validation:');
testPasswords.forEach(password => {
  const isStrong = customValidators.isStrongPassword(password);
  console.log(`Password: ${password} - Valid: ${isStrong}`);
  
  if (!isStrong) {
    console.log('  Checking requirements:');
    console.log('  - Length >= 8:', password.length >= 8);
    console.log('  - Length <= 128:', password.length <= 128);
    console.log('  - Has uppercase:', /[A-Z]/.test(password));
    console.log('  - Has lowercase:', /[a-z]/.test(password));
    console.log('  - Has numbers:', /\d/.test(password));
    console.log('  - Has special chars:', /[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    const weakPatterns = [
      /123456/, /password/, /qwerty/, /admin/, /letmein/,
      /welcome/, /monkey/, /dragon/, /master/, /superman/
    ];
    const hasWeakPattern = weakPatterns.some(pattern => pattern.test(password.toLowerCase()));
    console.log('  - Has weak pattern:', hasWeakPattern);
    
    const hasRepeatedChars = /(.)\1{3,}/.test(password);
    console.log('  - Has repeated chars (3+):', hasRepeatedChars);
    
    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
    console.log('  - Has sequential chars:', hasSequential);
  }
  console.log('');
});
