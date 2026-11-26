const mongoose = require('mongoose');
const Employee = require('../models/Employee');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateId(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('The employee ID is invalid.');
    error.statusCode = 400;
    throw error;
  }
}

function getValidationMessages(error) {
  return Object.values(error.errors).map((item) => item.message);
}

function validateBody(body, requireStatus) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object.'];
  }

  const requiredFields = [
    'employeeName',
    'email',
    'phoneNumber',
    'department',
    'designation',
    'joiningDate',
  ];
  if (requireStatus) requiredFields.push('status');

  return requiredFields
    .filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === '')
    .map((field) => `${field} is required.`);
}

async function getEmployees(req, res, next) {
  try {
    const { search, status, department } = req.query;
    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status filter must be Active or Inactive.' });
    }

    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department.trim();
    if (search && search.trim()) {
      const safeSearch = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ employeeName: safeSearch }, { email: safeSearch }];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Employees retrieved successfully.', data: employees });
  } catch (error) {
    return next(error);
  }
}

async function getEmployee(req, res, next) {
  try {
    validateId(req.params.id);
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.status(200).json({ success: true, message: 'Employee retrieved successfully.', data: employee });
  } catch (error) {
    return next(error);
  }
}

async function createEmployee(req, res, next) {
  try {
    const bodyErrors = validateBody(req.body, false);
    if (bodyErrors.length) {
      return res.status(400).json({ success: false, message: 'Please correct the employee information.', errors: bodyErrors });
    }
    const employee = await Employee.create(req.body);
    return res.status(201).json({ success: true, message: 'Employee created successfully.', data: employee });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Please correct the employee information.', errors: getValidationMessages(error) });
    }
    return next(error);
  }
}

async function updateEmployee(req, res, next) {
  try {
    validateId(req.params.id);
    const bodyErrors = validateBody(req.body, true);
    if (bodyErrors.length) {
      return res.status(400).json({ success: false, message: 'Please correct the employee information.', errors: bodyErrors });
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query',
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.status(200).json({ success: true, message: 'Employee updated successfully.', data: employee });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Please correct the employee information.', errors: error.name === 'ValidationError' ? getValidationMessages(error) : [error.message] });
    }
    return next(error);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    validateId(req.params.id);
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.status(200).json({ success: true, message: 'Employee deleted successfully.', data: employee });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
