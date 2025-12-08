// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  // Indian phone number format
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!validateEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!validateRequired(formData.password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// College signup form validation
export const validateCollegeSignupForm = (formData) => {
  const errors = {};

  if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!validateRequired(formData.collegeName)) {
    errors.collegeName = 'College name is required';
  }

  if (!validateEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!validatePhone(formData.contactNo)) {
    errors.contactNo = 'Valid phone number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Company signup form validation
export const validateCompanySignupForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.companyName)) {
    errors.companyName = 'Company name is required';
  }

  if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!validateEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!validatePhone(formData.contactNo)) {
    errors.contactNo = 'Valid phone number is required';
  }

  if (!validateRequired(formData.industry)) {
    errors.industry = 'Industry is required';
  }

  if (!validateRequired(formData.companySize)) {
    errors.companySize = 'Company size is required';
  }

  // Ensure companySize matches backend allowed values
  const allowedSizes = ['1-50', '51-200', '201-500', '501-1000', '1000+'];
  if (formData.companySize && !allowedSizes.includes(formData.companySize)) {
    errors.companySize = 'Company size must be one of: ' + allowedSizes.join(', ');
  }

  if (!validateRequired(formData.location)) {
    errors.location = 'Location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

