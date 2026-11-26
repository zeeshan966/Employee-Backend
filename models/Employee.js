const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: [true, 'Employee name is required.'],
      trim: true,
      maxlength: [100, 'Employee name cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email address cannot exceed 254 characters.'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      validate: {
        validator(value) {
          const digits = value.replace(/\D/g, '');
          return /^\+?[0-9\s().-]{7,25}$/.test(value) && digits.length >= 7 && digits.length <= 15;
        },
        message: 'Enter a valid phone number containing 7 to 15 digits.',
      },
    },
    department: {
      type: String,
      required: [true, 'Department is required.'],
      trim: true,
      maxlength: [80, 'Department cannot exceed 80 characters.'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required.'],
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters.'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required.'],
      validate: {
        validator(value) {
          return value instanceof Date && !Number.isNaN(value.getTime());
        },
        message: 'Enter a valid joining date.',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: 'Status must be Active or Inactive.',
      },
      default: 'Active',
      required: [true, 'Status is required.'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Employee', employeeSchema);
